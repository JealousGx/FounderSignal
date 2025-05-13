package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"log"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
)

type DashboardService interface {
	GetDashboardData(ctx context.Context, userID string) (*response.DashboardResponse, error)
}

type dashboardService struct {
	repo         repository.IdeaRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository
}

type ideasResult struct {
	ideas []*domain.Idea
	err   error
}
type signalsResult struct {
	signals []domain.Signal
	err     error
}
type signupsResult struct {
	signups []domain.AudienceMember
	err     error
}

func NewDashboardService(repo repository.IdeaRepository, signalRepo repository.SignalRepository,
	audienceRepo repository.AudienceRepository) *dashboardService {
	return &dashboardService{
		repo:         repo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
	}
}

func (s *dashboardService) GetDashboardData(ctx context.Context, userID string) (*response.DashboardResponse, error) {
	// Get current time and time range
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, -1, 0)
	sevenDaysAgo := now.AddDate(0, 0, -7)

	dashboardData := &response.DashboardResponse{}

	userIdeas, recentSignals, recentSignups, err := s.getDashboardPrerequisites(ctx, userID)
	if err != nil {
		// This error is from fetching userIdeas, which is critical.

		fmt.Printf("Failed to get dashboard prerequisites: %v\n", err)
		return nil, err
	}

	userIdeasMap := make(map[string]*domain.Idea) // For quick title lookup by string ID
	for _, idea := range userIdeas {
		userIdeasMap[idea.ID.String()] = idea
	}

	metrics, err := s.getAnalyticsMetrics(ctx, userID, thirtyDaysAgo, now, userIdeas)
	if err != nil {
		fmt.Printf("Failed to get analytics metrics: %v\n", err)
		return nil, fmt.Errorf("failed to get analytics metrics: %w", err)
	}
	dashboardData.Metrics = metrics

	recentIdeasDomain, err := s.getRecentIdeas(userIdeas)
	if err != nil {
		fmt.Printf("Failed to get recent ideas: %v\n", err)
		return nil, fmt.Errorf("failed to get recent ideas: %w", err)
	}
	dashboardData.RecentIdeas = recentIdeasDomain

	analyticsData, err := s.getAnalyticsData(ctx, sevenDaysAgo, now, userIdeas)
	if err != nil {
		fmt.Printf("Failed to get analytics data: %v\n", err)
		return nil, fmt.Errorf("failed to get analytics data: %w", err)
	}
	dashboardData.AnalyticsData = analyticsData

	recentActivity, err := s.getRecentActivity(recentSignals, recentSignups, userIdeasMap)
	if err != nil {
		fmt.Printf("Failed to get recent activity: %v\n", err)
		return nil, fmt.Errorf("failed to get recent activity: %w", err)
	}
	dashboardData.RecentActivity = recentActivity

	return dashboardData, nil
}

// get ideas, signals, and signups concurrently
func (s *dashboardService) getDashboardPrerequisites(ctx context.Context, userID string) (
	allUserIdeasWithCounts []*domain.Idea,
	recentSignals []domain.Signal,
	recentSignups []domain.AudienceMember,
	err error,
) {
	var wg sync.WaitGroup

	ideasCh := make(chan ideasResult, 1)
	signalsCh := make(chan signalsResult, 1)
	signupsCh := make(chan signupsResult, 1)

	wg.Add(3)

	go func() {
		defer wg.Done()
		ideas, _, fetchErr := s.repo.GetIdeas(ctx, domain.QueryParams{}, repository.IdeaQuerySpec{
			WithCounts: true,
			ByUserId:   userID,
		})
		ideasCh <- ideasResult{ideas: ideas, err: fetchErr}
	}()

	go func() {
		defer wg.Done()
		signals, fetchErr := s.signalRepo.GetRecentByUserIdeas(ctx, userID, 10)
		signalsCh <- signalsResult{signals: signals, err: fetchErr}
	}()

	go func() {
		defer wg.Done()
		signups, fetchErr := s.audienceRepo.GetRecentByUserIdeas(ctx, userID, 10)
		signupsCh <- signupsResult{signups: signups, err: fetchErr}
	}()

	wg.Wait()
	close(ideasCh)
	close(signalsCh)
	close(signupsCh)

	ideasRes := <-ideasCh
	if ideasRes.err != nil {
		return nil, nil, nil, fmt.Errorf("failed to get user ideas: %w", ideasRes.err)
	}
	allUserIdeasWithCounts = ideasRes.ideas

	signalsRes := <-signalsCh
	if signalsRes.err != nil {
		log.Printf("WARN: Failed to get recent signals for dashboard: %v", signalsRes.err)
		// Non-critical, can proceed with nil signals
	}
	recentSignals = signalsRes.signals

	signupsRes := <-signupsCh
	if signupsRes.err != nil {
		log.Printf("WARN: Failed to get recent signups for dashboard: %v", signupsRes.err)
		// Non-critical, can proceed with nil signups
	}
	recentSignups = signupsRes.signups

	return allUserIdeasWithCounts, recentSignals, recentSignups, nil
}

func (s *dashboardService) getAnalyticsMetrics(ctx context.Context, userID string, from, to time.Time, ideas []*domain.Idea) (response.Metrics, error) {
	currentPeriodIdeas, err := s.repo.GetIdeasWithActivity(ctx, userID, from, to)
	if err != nil {
		return response.Metrics{}, err
	}

	previousPeriodEnd := from.Add(-time.Nanosecond)
	previousPeriodStart := from.AddDate(0, 0, -int(to.Sub(from).Hours()/24)) // Calculate duration of 'from'-'to' and subtract

	previousPeriodIdeas, err := s.repo.GetIdeasWithActivity(ctx, userID, previousPeriodStart, previousPeriodEnd)
	if err != nil {
		return response.Metrics{}, err
	}

	var totalSignups, totalViews, ideasValidated int
	var totalConversionRate float64
	var currentGloballyValidatedIdeasCount int
	var totalGlobalSignupsAcrossAllIdeas int64
	ideasWithData := 0

	for _, idea := range ideas {
		totalGlobalSignupsAcrossAllIdeas += int64(idea.Signups) // Assuming idea.Signups is the global count

		if idea.TargetSignups > 0 && idea.Signups >= idea.TargetSignups {
			currentGloballyValidatedIdeasCount++
			// ... (logic for TimeToValidate, can be removed or commented out) ...
		}
	}

	for _, idea := range currentPeriodIdeas {
		totalSignups += idea.Signups
		totalViews += idea.Views

		if idea.Signups >= idea.TargetSignups {
			ideasValidated++
		}

		if idea.Views > 0 {
			totalConversionRate += float64(idea.Signups) / float64(idea.Views) * 100
			ideasWithData++
		}
	}

	var prevTotalSignups, prevIdeasValidated int
	var prevTotalConversionRate float64
	prevIdeasWithData := 0

	for _, idea := range previousPeriodIdeas {
		prevTotalSignups += idea.Signups
		if idea.Signups >= idea.TargetSignups {
			prevIdeasValidated++
		}
		if idea.Views > 0 {
			prevTotalConversionRate += float64(idea.Signups) / float64(idea.Views) * 100
			prevIdeasWithData++
		}
	}

	avgConversion := 0.0
	if ideasWithData > 0 {
		avgConversion = totalConversionRate / float64(ideasWithData)
	}

	prevAvgConversion := 0.0
	if prevIdeasWithData > 0 {
		prevAvgConversion = prevTotalConversionRate / float64(prevIdeasWithData)
	}

	signupsChange := 0.0
	if prevTotalSignups > 0 {
		signupsChange = (float64(totalSignups-prevTotalSignups) / float64(prevTotalSignups)) * 100
	} else if totalSignups > 0 {
		signupsChange = 100.0
	}

	conversionChange := 0.0
	if prevAvgConversion > 0 {
		conversionChange = (avgConversion - prevAvgConversion) / prevAvgConversion * 100
	} else if avgConversion > 0 {
		conversionChange = 100.0
	}

	ideasChange := 0.0
	if prevIdeasValidated > 0 {
		ideasChange = (float64(ideasValidated-prevIdeasValidated) / float64(prevIdeasValidated)) * 100
	} else if ideasValidated > 0 {
		ideasChange = 100.0
	}

	var averageSignupsPerIdea float64
	if len(ideas) > 0 {
		averageSignupsPerIdea = float64(totalGlobalSignupsAcrossAllIdeas) / float64(len(ideas))
	}
	return response.Metrics{
		TotalSignups:          totalSignups,
		SignupsChange:         signupsChange,
		AvgConversion:         avgConversion,
		ConversionChange:      conversionChange,
		IdeasValidated:        ideasValidated,
		IdeasChange:           ideasChange,
		AverageSignupsPerIdea: averageSignupsPerIdea,
	}, nil
}

func (s *dashboardService) getRecentIdeas(ideas []*domain.Idea) ([]domain.Idea, error) {
	// Sort by CreatedAt DESC to get the most recent ones
	sort.SliceStable(ideas, func(i, j int) bool {
		return ideas[i].CreatedAt.After(ideas[j].CreatedAt)
	})

	limit := 5
	if len(ideas) < limit {
		limit = len(ideas)
	}

	var recentIdeas []domain.Idea
	for i := 0; i < limit; i++ {
		idea := ideas[i]
		var engagementRate float64
		if idea.Views > 0 {
			engagementRate = (float64(idea.Signups) / float64(idea.Views)) * 100
		}

		idea.EngagementRate = engagementRate
		recentIdeas = append(recentIdeas, *idea)
	}

	return recentIdeas, nil
}

func (s *dashboardService) getAnalyticsData(
	ctx context.Context,
	from, to time.Time,
	ideas []*domain.Idea,
) ([]response.AnalyticsData, error) {
	var result []response.AnalyticsData

	const MAX_IDEAS = 5

	if len(ideas) == 0 {
		return result, nil
	}

	// sort by Signups (desc), then by Views (desc)
	sort.SliceStable(ideas, func(i, j int) bool {
		if ideas[i].Signups != ideas[j].Signups {
			return ideas[i].Signups > ideas[j].Signups // Higher signups first
		}
		return ideas[i].Views > ideas[j].Views // Then higher views first
	})

	// for testing purposes, slice the ideas to a maximum of 10
	if len(ideas) > MAX_IDEAS {
		ideas = ideas[:MAX_IDEAS]
	}

	var ideaIDs []uuid.UUID
	for _, idea := range ideas {
		ideaIDs = append(ideaIDs, idea.ID)
	}

	// These two DB calls for daily aggregated data are specific time-series queries.
	dailyViews, err := s.signalRepo.GetDailyViewsByIdeaIDs(ctx, ideaIDs, from, to)
	if err != nil {
		return result, fmt.Errorf("failed to get daily views: %w", err)
	}

	dailySignups, err := s.audienceRepo.GetSignupsByIdeaIds(ctx, ideaIDs, from, to)
	if err != nil {
		return result, fmt.Errorf("failed to get daily signups: %w", err)
	}

	for _, idea := range ideas {
		var ideaDataPoints []response.DataPoint
		ideaTotalViews := 0
		ideaTotalSignups := 0
		ideaTotalConversionPoints := 0
		var ideaTotalConversionValue float64 = 0.0

		currentDay := from
		for !currentDay.After(to) { // Iterate up to and including 'to' date
			year, month, day := currentDay.Date()
			mapLookupKeyTime := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
			dayStr := mapLookupKeyTime.Format(time.RFC3339) // Standard date format for map keys
			formattedDate := currentDay.Format("Jan 02")    // For display

			views := 0
			if ideaViewsMap, ok := dailyViews[idea.ID]; ok {
				if v, okDate := ideaViewsMap[dayStr]; okDate {
					views = v
				}
			}

			signups := 0
			if ideaSignupsMap, ok := dailySignups[idea.ID]; ok {
				if s, okDate := ideaSignupsMap[dayStr]; okDate {
					signups = s
				}
			}

			conversionRate := 0.0
			if views > 0 {
				conversionRate = (float64(signups) / float64(views)) * 100
				ideaTotalConversionPoints++
				ideaTotalConversionValue += conversionRate
			}

			ideaTotalViews += views
			ideaTotalSignups += signups

			ideaDataPoints = append(ideaDataPoints, response.DataPoint{
				Date:           formattedDate,
				Views:          views,
				Signups:        signups,
				ConversionRate: conversionRate,
			})

			currentDay = currentDay.AddDate(0, 0, 1)
		}

		ideaAverageConversionRate := 0.0
		if ideaTotalConversionPoints > 0 {
			ideaAverageConversionRate = ideaTotalConversionValue / float64(ideaTotalConversionPoints)
		}

		ideaTotals := response.Totals{
			Views:                 ideaTotalViews,
			Signups:               ideaTotalSignups,
			AverageConversionRate: ideaAverageConversionRate,
		}

		result = append(result, response.AnalyticsData{
			IdeaID:     idea.ID,
			IdeaTitle:  idea.Title,
			DataPoints: ideaDataPoints,
			Totals:     ideaTotals,
		})
	}

	return result, nil
}

func (s *dashboardService) getRecentActivity(
	recentSignals []domain.Signal,
	recentSignups []domain.AudienceMember,
	ideas map[string]*domain.Idea, // Key: idea.ID.String(), Value: *domain.Idea
) ([]response.ActivityItem, error) {
	var activities []response.ActivityItem

	for _, signal := range recentSignals {
		var message string
		switch signal.EventType {
		case string(domain.EventTypePageView):
			message = "Someone viewed your landing page"
		case string(domain.EventTypeClick):
			message = "Someone clicked your CTA button"
		case string(domain.EventTypeScroll):
			message = "Someone scrolled through your landing page"
		default:
			message = "Someone interacted with your landing page"
		}

		ideaTitle := "Unknown Idea"
		idea, exists := ideas[signal.IdeaID.String()]
		if exists {
			ideaTitle = idea.Title
		}

		activities = append(activities, response.ActivityItem{
			ID:        signal.ID.String(),
			Type:      string(signal.EventType),
			IdeaID:    signal.IdeaID.String(),
			IdeaTitle: ideaTitle,
			Message:   message,
			Timestamp: signal.CreatedAt,
		})
	}

	// Process signups
	for _, signup := range recentSignups {
		ideaTitle := "Unknown Idea"
		idea, exists := ideas[signup.IdeaID.String()]
		if exists {
			ideaTitle = idea.Title
		}
		activities = append(activities, response.ActivityItem{
			ID:        signup.UserID,
			Type:      "signup",
			IdeaID:    signup.IdeaID.String(),
			IdeaTitle: ideaTitle,
			Message:   "Someone signed up for your idea",
			Timestamp: signup.SignupTime,
		})
	}

	sort.Slice(activities, func(i, j int) bool {
		return activities[i].Timestamp.After(activities[j].Timestamp)
	})

	if len(activities) > 10 {
		activities = activities[:10]
	}

	return activities, nil
}
