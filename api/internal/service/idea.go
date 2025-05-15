package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"foundersignal/pkg/validator"
	"log"
	"time"

	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"
	"gorm.io/datatypes"
)

type IdeaService interface {
	Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error)
	GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error)
	GetUserIdeas(ctx context.Context, userId string, getStats bool, queryParams domain.QueryParams) (*response.IdeaListResponse, error)
	GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error)
	// UpdateMVP(ctx context.Context, mvpId, ideaId uuid.UUID, userId string, req *request.UpdateMVP) error
	// GetTopIdeas(ctx context.Context, userId string, queryParams domain.QueryParams) ([]response.PrivateTopIdeaList, error)
	RecordSignal(ctx context.Context, ideaID uuid.UUID, userID string, eventType string, ipAddress string, userAgent string, metadata map[string]interface{}) error
}

type ideaService struct {
	repo         repository.IdeaRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository
}

func NewIdeasService(repo repository.IdeaRepository, signalRepo repository.SignalRepository,
	audienceRepo repository.AudienceRepository) *ideaService {
	return &ideaService{
		repo:         repo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
	}
}

func (s *ideaService) Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error) {
	if err := validator.Validate(req); err != nil {
		return uuid.Nil, err
	}

	idea := &domain.Idea{
		UserID:         userId,
		Title:          req.Title,
		Description:    req.Description,
		TargetAudience: req.TargetAudience,
	}

	mvp := &domain.MVPSimulator{
		IdeaID:      idea.ID,
		Headline:    idea.Title,
		Subheadline: idea.Description,
		CTAButton:   req.CTAButton,
	}

	return s.repo.CreateWithMVP(ctx, idea, mvp)
}

func (s *ideaService) GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error) {
	includeRelated := true
	idea, relatedIdeas, err := s.repo.GetByID(ctx, id, &includeRelated)
	if err != nil {
		return nil, err
	}

	// ideaJSON, err := json.MarshalIndent(idea, "", "  ") // Marshal to JSON with indentation
	// if err != nil {
	// 	fmt.Println("Error marshalling idea to JSON:", err)
	// 	// Decide if you want to return the error or just log it and proceed
	// } else {
	// 	fmt.Println("Found idea (JSON):", string(ideaJSON))
	// }

	publicIdea := dto.ToPublicIdea(idea, relatedIdeas, userId)

	return publicIdea, nil
}

func (s *ideaService) GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error) {
	ideasRaw, totalCount, err := s.repo.GetIdeas(ctx, queryParams, repository.IdeaQuerySpec{
		Status:     domain.IdeaStatusActive,
		WithCounts: true,
	})
	if err != nil {
		return nil, err
	}

	ideas := dto.ToIdeasListResponse(ideasRaw, totalCount, nil)

	return ideas, nil
}

func (s *ideaService) GetUserIdeas(ctx context.Context, userId string, getStats bool, queryParams domain.QueryParams) (*response.IdeaListResponse, error) {
	ideasRaw, totalCount, err := s.repo.GetIdeas(ctx, queryParams, repository.IdeaQuerySpec{
		WithCounts: true,
		ByUserId:   userId,
		Status:     domain.IdeaStatus(queryParams.FilterBy),
	})
	if err != nil {
		return nil, err
	}

	var stats *response.UserDashboardStats

	if getStats {
		stats, err = s.getUserDashboardStats(ctx, userId)
		if err != nil {
			return nil, err
		}
	}

	ideas := dto.ToIdeasListResponse(ideasRaw, totalCount, stats)

	return ideas, nil
}

func (s *ideaService) RecordSignal(ctx context.Context, ideaID uuid.UUID, userID string, eventType string, ipAddress string, userAgent string, metadata map[string]interface{}) error {
	signal := &domain.Signal{
		IdeaID:    ideaID,
		UserID:    userID,
		EventType: eventType,
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}

	if metadata != nil {
		metaJSON, err := json.Marshal(metadata)
		if err != nil {
			return fmt.Errorf("failed to marshal metadata: %w", err)
		}
		signal.Metadata = datatypes.JSON(metaJSON)
	}

	err := s.signalRepo.Create(ctx, signal)
	if err != nil {
		return fmt.Errorf("failed to create signal: %w", err)
	}

	// If the event is a CTA click and we have a UserID, create/update AudienceMember
	if eventType == "cta_click" && userID != "" {
		_, err := s.audienceRepo.Upsert(ctx, ideaID, userID)
		if err != nil {
			// Log this error but don't necessarily fail the whole signal recording
			log.Printf("WARN: Failed to upsert audience member for idea %s, user %s after CTA click: %v", ideaID, userID, err)
		}
	}

	return nil
}

func (s *ideaService) getUserDashboardStats(ctx context.Context, userId string) (*response.UserDashboardStats, error) {
	now := time.Now()
	currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd, _ := getTrendDateRanges(now)

	var currentTotalIdeas, prevMonthTotalIdeas int64
	var currentActiveIdeas, prevMonthActiveIdeas int64
	var currentMonthSignups, prevMonthSignups int64
	var currentMonthViews, prevMonthViews int64
	var totalViews, totalSignups int64

	activeStatus := domain.IdeaStatusActive
	pageViewEventType := domain.EventTypePageView

	g, gCtx := errgroup.WithContext(ctx)

	// get total ideas count for this month
	g.Go(func() error {
		var err error
		currentTotalIdeas, err = s.repo.GetCountForUser(gCtx, userId, &currentMonthStart, &currentMonthEnd, nil)
		return err
	})

	// get total ideas count for prev month
	g.Go(func() error {
		var err error
		prevMonthTotalIdeas, err = s.repo.GetCountForUser(gCtx, userId, &prevMonthStart, &prevMonthEnd, nil)
		return err
	})

	// get active ideas count for this month
	g.Go(func() error {
		var err error
		currentActiveIdeas, err = s.repo.GetCountForUser(gCtx, userId, &currentMonthStart, &currentMonthEnd, &activeStatus)
		return err
	})

	// get active ideas count for prev month
	g.Go(func() error {
		var err error
		prevMonthActiveIdeas, err = s.repo.GetCountForUser(gCtx, userId, &prevMonthStart, &prevMonthEnd, &activeStatus)

		return err
	})

	// get total signups count for this month
	g.Go(func() error {
		var err error
		currentMonthSignups, err = s.audienceRepo.GetCountForIdeaOwner(gCtx, userId, &currentMonthStart, &currentMonthEnd)
		return err
	})

	// get total signups count for prev month
	g.Go(func() error {
		var err error
		prevMonthSignups, err = s.audienceRepo.GetCountForIdeaOwner(gCtx, userId, &prevMonthStart, &prevMonthEnd)
		return err
	})

	g.Go(func() error {
		var err error
		currentMonthViews, err = s.signalRepo.GetCountForIdeaOwner(gCtx, userId, repository.SignalQuerySpecs{
			EventType: pageViewEventType,
			Start:     &currentMonthStart,
			End:       &currentMonthEnd,
		})
		return err
	})

	g.Go(func() error {
		var err error
		prevMonthViews, err = s.signalRepo.GetCountForIdeaOwner(gCtx, userId, repository.SignalQuerySpecs{
			EventType: pageViewEventType,
			Start:     &prevMonthStart,
			End:       &prevMonthEnd,
		})
		return err
	})

	g.Go(func() error {
		var err error
		totalViews, err = s.signalRepo.GetCountForIdeaOwner(gCtx, userId, repository.SignalQuerySpecs{
			EventType: domain.EventTypePageView})
		return err
	})

	g.Go(func() error {
		var err error
		totalSignups, err = s.audienceRepo.GetCountForIdeaOwner(gCtx, userId, nil, nil)
		return err
	})

	if err := g.Wait(); err != nil {
		return nil, fmt.Errorf("getUserDashboardStats: failed to fetch stats concurrently: %w", err)
	}

	// Calculate the trend ratios
	signupChange := calculateTrendRatio(float64(currentMonthSignups), float64(prevMonthSignups))
	viewChange := calculateTrendRatio(float64(currentMonthViews), float64(prevMonthViews))
	activeIdeasChange := calculateTrendRatio(float64(currentActiveIdeas), float64(prevMonthActiveIdeas))
	totalIdeasChange := calculateTrendRatio(float64(currentTotalIdeas), float64(prevMonthTotalIdeas))

	return &response.UserDashboardStats{
		ActiveIdeas:       currentActiveIdeas,
		TotalSignups:      totalSignups,
		TotalViews:        totalViews,
		TotalIdeasChange:  totalIdeasChange,
		ActiveIdeasChange: activeIdeasChange,
		SignupsChange:     signupChange,
		ViewsChange:       viewChange,
	}, nil
}

func generateLandingPageContent(mvpDetails domain.MVPSimulator) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; min-height: 100vh; box-sizing: border-box; background-color: #f4f7f6; color: #333; }
        .mvp-container { max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; margin-bottom: 15px; }
        p { color: #555; line-height: 1.6; margin-bottom: 25px; }
        button { background-color: #3498db; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease; }
        button:hover { background-color: #2980b9; }
        .spacer { height: 1000px; } /* For scroll testing */
    </style>
</head>
<body>
    <div class="mvp-container">
        <h1>%s</h1>
        <p>%s</p>
        <button id="ctaButton">%s</button>
    </div>
    <div class="spacer"></div>

    <script>
        (function() {
            const ideaId = "%s";
            const postTrackEvent = (eventType, metadata) => {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({ type: 'founderSignalTrack', eventType: eventType, ideaId: ideaId, metadata: metadata }, '*');
                }
            };

            // 1. Track Page View
            postTrackEvent('pageview', { path: window.location.pathname, title: document.title });

            // 2. Track CTA Click
            const ctaButton = document.getElementById('ctaButton');
            if (ctaButton) {
                ctaButton.addEventListener('click', function() {
                    postTrackEvent('cta_click', { buttonText: ctaButton.innerText, ctaElementId: ctaButton.id });
                    alert('Thanks for your interest!'); // Optional: client-side feedback
                });
            }

            // 3. Track Scroll Depth
            let scrollReached = { 25: false, 50: false, 75: false, 100: false };
            let scrollTimeout;
            function handleScroll() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const docElem = document.documentElement;
                    const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
                    if (scrollHeight === 0) { // Content not scrollable or fully visible
                        if (!scrollReached[100]) {
                            postTrackEvent('scroll_depth', { percentage: 100 });
                            scrollReached[100] = true;
                        }
                        return;
                    }
                    const scrollTop = window.pageYOffset || docElem.scrollTop;
                    const currentPercentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

                    [25, 50, 75, 100].forEach(depth => {
                        if (currentPercentage >= depth && !scrollReached[depth]) {
                            postTrackEvent('scroll_depth', { percentage: depth });
                            scrollReached[depth] = true;
                        }
                    });
                }, 150); // Debounce scroll events
            }
            // Initial check in case content is not scrollable but covers depths
            handleScroll(); 
            window.addEventListener('scroll', handleScroll, { passive: true });

            // 4. Track Time on Page
            const startTime = Date.now();
            const sendTimeOnPage = () => {
                const durationSeconds = Math.round((Date.now() - startTime) / 1000);
                postTrackEvent('time_on_page', { duration_seconds: durationSeconds });
            };
            
            // More reliable way to send data on page unload
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    sendTimeOnPage();
                }
            });
            // As a fallback, though 'pagehide' or 'beforeunload' can be unreliable for async.
            // The postMessage should be synchronous enough.
            window.addEventListener('pagehide', sendTimeOnPage);

        })();
    </script>
</body>
</html>`, mvpDetails.Headline, mvpDetails.Headline, mvpDetails.Subheadline, mvpDetails.CTAButton, mvpDetails.IdeaID.String())
}

// calculateTrendRatio calculates the percentage change as a ratio.
// e.g., 0.1 for +10%, -0.05 for -5%.
func calculateTrendRatio(currentValue, previousValue float64) float64 {
	if previousValue == 0 {
		if currentValue > 0 {
			return 100
		}

		return 0.0
	}

	if currentValue == previousValue {
		return 0
	}

	return (currentValue - previousValue) / previousValue * 100
}

// getTrendDateRanges provides date ranges for current and previous periods.
func getTrendDateRanges(t time.Time) (
	currentPeriodStart, currentPeriodEnd time.Time, // For "current month up to now"
	previousPeriodStart, previousPeriodEnd time.Time, // For "entire previous month"
	startOfCurrentMonthForComparison time.Time, // For counts "before the start of the current month"
) {
	currentYear, currentMonth, _ := t.Date()
	location := t.Location()

	startOfCurrentMonthForComparison = time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, location)
	currentPeriodStart = startOfCurrentMonthForComparison
	currentPeriodEnd = t // "Now" for current month's activity up to this moment

	previousPeriodStart = startOfCurrentMonthForComparison.AddDate(0, -1, 0)   // First day of previous month
	previousPeriodEnd = startOfCurrentMonthForComparison.Add(-time.Nanosecond) // Last moment of previous month

	return
}
