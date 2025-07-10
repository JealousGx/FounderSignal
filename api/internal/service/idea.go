package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/pkg/prompts"
	"foundersignal/internal/repository"
	"foundersignal/pkg/validator"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"golang.org/x/sync/errgroup"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type IdeaService interface {
	Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error)
	Update(ctx context.Context, userId string, ideaId uuid.UUID, req request.UpdateIdea) error
	Delete(ctx context.Context, userId string, ideaId uuid.UUID) error
	GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error)
	GetUserIdeas(ctx context.Context, userId string, getStats bool, queryParams domain.QueryParams) (*response.IdeaListResponse, error)
	GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error)
	RecordSignal(ctx context.Context, ideaID, mvpId uuid.UUID, userID string, eventType string, ipAddress string, userAgent string, metadata map[string]interface{}) error
}

type ideaService struct {
	u            repository.UserRepository
	repo         repository.IdeaRepository
	mvpRepo      repository.MVPRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository

	aiService AIService
}

const (
	RegisteredUserPlaceholderEmail = "registered_user"
	AnonymousUserPlaceholderEmail  = "anonymous_user"
)

func NewIdeasService(repo repository.IdeaRepository, mvpRepo repository.MVPRepository, u repository.UserRepository, signalRepo repository.SignalRepository,
	audienceRepo repository.AudienceRepository, aiService AIService) *ideaService {
	return &ideaService{
		u:            u,
		repo:         repo,
		mvpRepo:      mvpRepo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
		aiService:    aiService,
	}
}

func (s *ideaService) Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error) {
	user, err := s.u.FindByID(ctx, userId)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to find user: %w", err)
	}
	if user == nil {
		return uuid.Nil, fmt.Errorf("user not found")
	}

	// The following commented-out code is a placeholder for future logic to handle starter trial limits.
	// if !user.IsPaying && user.UsedFreeTrial {
	// 	return uuid.Nil, fmt.Errorf("you have reached your idea limit for the starter plan. please upgrade your plan to create more ideas")
	// }

	ideaStatus := domain.IdeaStatusActive
	ideaLimit := domain.GetIdeaLimitForPlan(user.Plan)
	activeStatus := domain.IdeaStatusActive
	currentCount, err := s.repo.GetCountForUser(ctx, userId, nil, nil, &activeStatus)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to check idea count: %w", err)
	}
	if int(currentCount) >= ideaLimit {
		ideaStatus = domain.IdeaStatusDraft // If user has reached their limit, set status to draft
	}

	if err := validator.Validate(req); err != nil {
		return uuid.Nil, err
	}

	if userId == "" {
		return uuid.Nil, fmt.Errorf("userId is required")
	}

	// unique slug for the idea, include last part of userId at the end of the slug
	ideaSlug := slug.Make(req.Title)

	var userIdSuffix string
	if len(userId) >= 4 {
		userIdSuffix = strings.ToLower(userId[len(userId)-4:]) // get last 4 chars and lowercase
	} else if len(userId) > 0 {
		userIdSuffix = strings.ToLower(userId) // If userId is shorter than 4 chars, use the whole thing
	}

	ideaSlug = fmt.Sprintf("%s-%s", ideaSlug, userIdSuffix)

	idea := &domain.Idea{
		UserID:         userId,
		Title:          req.Title,
		Description:    req.Description,
		TargetAudience: req.TargetAudience,
		Slug:           ideaSlug,
		Status:         string(ideaStatus),
	}

	ideaId, err := s.repo.Create(ctx, idea)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create idea: %w", err)
	}

	mvp := &domain.MVPSimulator{
		Base:     domain.Base{ID: uuid.New()},
		IdeaID:   ideaId,
		Name:     "Initial Version",
		IsActive: true,
	}

	promptData := prompts.LandingPagePromptData{
		IdeaID:         ideaId.String(),
		MVPID:          mvp.ID.String(),
		Title:          idea.Title,
		Description:    idea.Description,
		TargetAudience: idea.TargetAudience,
		CTAButtonText:  req.CTAButton,
	}

	prompt, err := prompts.BuildLandingPagePrompt(promptData)
	if err != nil {
		log.Printf("Error building landing page prompt for idea %s: %v", idea.ID, err)
		mvp.HTMLContent = ""
	} else {
		htmlContent, err := s.aiService.Generate(ctx, prompt)
		if err != nil {
			log.Printf("Error generating AI landing page for idea %s: %v", idea.ID, err)
			mvp.HTMLContent = generateLandingPageContent(ideaId, mvp.ID, idea.Title, idea.Description, req.CTAButton)
		} else {
			mvp.HTMLContent = htmlContent
		}
	}

	if _, err := s.mvpRepo.Create(ctx, mvp); err != nil {
		log.Printf("Error creating MVP for idea %s: %v", idea.ID, err)
		return ideaId, fmt.Errorf("failed to create MVP for idea: %w", err)
	}

	// If the user is on the starter plan / not paying, set the UsedFreeTrial flag to true
	if !user.IsPaying && !user.UsedFreeTrial {
		_user := &domain.User{
			UsedFreeTrial: true,
		}

		if err := s.u.Update(ctx, userId, _user); err != nil {
			log.Printf("WARNING: Failed to update user after creating idea: %v", err)
		}
	}

	return ideaId, nil
}

func (s *ideaService) Update(ctx context.Context, userId string, ideaId uuid.UUID, req request.UpdateIdea) error {
	user, err := s.u.FindByID(ctx, userId)
	if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// Check if the idea exists
	existingIdea, _, err := s.repo.GetByID(ctx, ideaId, nil, nil)
	if err != nil {
		return err
	}

	if existingIdea == nil {
		return gorm.ErrRecordNotFound
	}

	if existingIdea.UserID != userId {
		return fmt.Errorf("user not authorized to update this idea")
	}

	if req.Status != nil && *req.Status == string(domain.IdeaStatusActive) && existingIdea.Status != string(domain.IdeaStatusActive) {
		activeStatus := domain.IdeaStatusActive
		currentCount, err := s.repo.GetCountForUser(ctx, userId, nil, nil, &activeStatus)
		if err != nil {
			return fmt.Errorf("failed to check idea count: %w", err)
		}

		ideaLimit := domain.GetIdeaLimitForPlan(user.Plan)
		if int(currentCount) >= ideaLimit {
			return fmt.Errorf("you have reached your idea limit for the %s plan. please upgrade your plan or deactivate an idea to activate more", user.Plan)
		}
	}

	if req.IsPrivate != nil && *req.IsPrivate && user.Plan == domain.StarterPlan {
		return fmt.Errorf("private ideas are not allowed on the starter plan. please upgrade your plan to create private ideas")
	}

	idea := &domain.Idea{
		Base: domain.Base{
			ID: ideaId,
		},
	}
	if req.Title != nil {
		idea.Title = *req.Title
	}
	if req.Description != nil {
		idea.Description = *req.Description
	}
	if req.Status != nil {
		idea.Status = *req.Status
	}
	if req.Stage != nil {
		idea.Stage = *req.Stage
	}
	if req.ImageURL != nil {
		idea.ImageURL = *req.ImageURL
	}
	if req.TargetAudience != nil {
		idea.TargetAudience = *req.TargetAudience
	}
	if req.TargetSignups != nil {
		idea.TargetSignups = *req.TargetSignups
	}
	if req.IsPrivate != nil {
		idea.IsPrivate = req.IsPrivate
	}

	// Update the idea
	if err := s.repo.Update(ctx, idea); err != nil {
		return err
	}

	return nil
}

func (s *ideaService) Delete(ctx context.Context, userId string, ideaId uuid.UUID) error {
	// Check if the idea exists
	existingIdea, _, err := s.repo.GetByID(ctx, ideaId, nil, nil)
	if err != nil {
		return err
	}

	if existingIdea == nil {
		return gorm.ErrRecordNotFound
	}

	if existingIdea.UserID != userId {
		return fmt.Errorf("user not authorized to delete this idea")
	}

	// Delete the idea
	if err := s.repo.Delete(ctx, ideaId); err != nil {
		return err
	}

	return nil
}

func (s *ideaService) GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error) {
	includeRelated := true
	withUser := true
	idea, relatedIdeas, err := s.repo.GetByID(ctx, id, &includeRelated, &withUser)
	if err != nil {
		return nil, err
	}

	// Only the owner can view non-active ideas
	if idea.Status != string(domain.IdeaStatusActive) && idea.UserID != userId {
		return nil, gorm.ErrRecordNotFound
	}

	publicIdea := dto.ToPublicIdea(idea, relatedIdeas, userId)

	return publicIdea, nil
}

func (s *ideaService) GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error) {
	// This method is used for the /explore endpoint and only returns active ideas
	includePrivateIdeas := false
	ideasRaw, totalCount, err := s.repo.GetIdeas(ctx, queryParams, repository.IdeaQuerySpec{
		IncludePrivate: &includePrivateIdeas,
		Status:         domain.IdeaStatusActive, // Only active ideas
		WithCounts:     true,
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

func (s *ideaService) RecordSignal(ctx context.Context, ideaID, mvpId uuid.UUID, userID string, eventType string, ipAddress string, userAgent string, metadata map[string]interface{}) error {

	if ideaID == uuid.Nil || mvpId == uuid.Nil {
		return fmt.Errorf("ideaID and mvpId are required to record a signal")
	}

	var metadataJson datatypes.JSON
	if metadata != nil {
		_metaJSON, err := json.Marshal(metadata)
		if err != nil {
			return fmt.Errorf("failed to marshal metadata: %w", err)
		}
		metadataJson = datatypes.JSON(_metaJSON)
	}

	idea, _, err := s.repo.GetByID(ctx, ideaID, nil, nil)
	if err != nil {
		return fmt.Errorf("failed to get idea by ID: %w", err)
	}
	if idea == nil {
		return fmt.Errorf("idea not found")
	}

	isPrivate := idea.IsPrivate != nil && *idea.IsPrivate
	if idea.Status != string(domain.IdeaStatusActive) || isPrivate {
		return fmt.Errorf("cannot record signal for idea that is either non-active or private")
	}

	signal := &domain.Signal{
		IdeaID:         ideaID,
		MVPSimulatorID: mvpId,
		UserID:         userID,
		EventType:      eventType,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
		Metadata:       metadataJson,
	}

	err = s.signalRepo.Create(ctx, signal)
	if err != nil {
		return fmt.Errorf("failed to create signal: %w", err)
	}

	// If the event is a CTA click, create/update AudienceMember
	if eventType == "cta_click" {
		var finalUserID string
		var userEmail string

		if userID != "" {
			finalUserID = userID
			user, err := s.u.FindByID(ctx, userID)

			if err != nil {
				log.Printf("Failed to find user by ID: %v\n", err)

				// Do not return error, proceed with placeholder email
				userEmail = RegisteredUserPlaceholderEmail
			} else if user == nil {
				log.Printf("User not found for ID: %s\n", userID)

				// Do not return error, proceed with placeholder email
				userEmail = RegisteredUserPlaceholderEmail
			} else {
				userEmail = user.Email
			}
		} else {
			finalUserID = uuid.New().String()         // Generate a new UUID if userID is not provided
			userEmail = AnonymousUserPlaceholderEmail // Placeholder for anonymous users
		}

		_, err = s.audienceRepo.Upsert(ctx, ideaID, mvpId, finalUserID, userEmail)
		if err != nil {
			// Log this error but don't necessarily fail the whole signal recording
			log.Printf("WARN: Failed to upsert audience member for idea %s, user %s after CTA click: %v", ideaID, finalUserID, err)
		}
	}

	return nil
}

func (s *ideaService) getUserDashboardStats(ctx context.Context, userId string) (*response.UserDashboardStats, error) {
	now := time.Now()
	currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd, _ := getTrendDateRanges(now)

	var totalActiveIdeas int64
	var currentTotalIdeas, prevMonthTotalIdeas int64
	var currentActiveIdeas, prevMonthActiveIdeas int64
	var currentMonthSignups, prevMonthSignups int64
	var currentMonthViews, prevMonthViews int64
	var totalViews, totalSignups int64

	activeStatus := domain.IdeaStatusActive
	pageViewEventType := domain.EventTypePageView

	g, gCtx := errgroup.WithContext(ctx)

	// get active ideas count
	g.Go(func() error {
		var err error
		totalActiveIdeas, err = s.repo.GetCountForUser(gCtx, userId, nil, nil, &activeStatus)
		return err
	})

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
		ActiveIdeas:       totalActiveIdeas,
		TotalSignups:      totalSignups,
		TotalViews:        totalViews,
		TotalIdeasChange:  totalIdeasChange,
		ActiveIdeasChange: activeIdeasChange,
		SignupsChange:     signupChange,
		ViewsChange:       viewChange,
	}, nil
}

func generateLandingPageContent(ideaId, mvpId uuid.UUID, headline, subheadline, ctaBtn string) string {
	const TAILWIND_CSS_URL = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"

	return fmt.Sprintf(
		`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <meta name="description" content="%s">
    <link href="%s" rel="stylesheet">
</head>
<body>
    <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold text-center mb-8">
            Your Landing Page
          </h1>
          <p class="text-lg text-center mb-8">
            Start building your MVP landing page!
          </p>
          <div class="text-center">
            <button
              id="ctaButton"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              %s
            </button>
          </div>
        </div>
    <script data-founder-signal-script="true">(function() {
            const ideaId = "%s";
			const mvpId = "%s";
            const postTrackEvent = (eventType, metadata) => {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({ type: 'founderSignalTrack', eventType: eventType, ideaId: ideaId, mvpId: mvpId, metadata: metadata }, '*');
                }
            };

            // 1. Track Page View
            postTrackEvent('pageview', { path: window.location.pathname, title: document.title });

            // 2. Track CTA Click
            const $ctaButton = document.getElementById('ctaButton');
            if ($ctaButton) {
                $ctaButton.addEventListener('click', function() {
                    postTrackEvent('cta_click', { buttonText: $ctaButton.innerText, ctaElementId: $ctaButton.id });
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
</html>`,
		headline,
		subheadline,
		TAILWIND_CSS_URL,
		ctaBtn,
		ideaId.String(),
		mvpId.String(),
	)
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
