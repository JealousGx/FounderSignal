package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/pkg"
	"foundersignal/internal/repository"
	"log"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
)

type DashboardService interface {
	GetDashboardData(ctx context.Context, userID string) (*response.DashboardResponse, error)
	GetRecentActivityForUser(ctx context.Context, userId string) ([]response.ActivityItem, error)
	GetIdea(ctx context.Context, id uuid.UUID, userId string, specs DashboardIdeaSpecs) (*response.DashboardIdeaResponse, error)
	GetAudienceForFounder(ctx context.Context, founderId string, withStats bool, queryParams domain.QueryParams) (response.AudienceResponse, error)
}

type dashboardService struct {
	repo         repository.IdeaRepository
	mvpRepo      repository.MVPRepository
	feedbackRepo repository.FeedbackRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository
	reactionRepo repository.ReactionRepository
}

type signalsResult struct {
	signals []domain.Signal
	err     error
}
type signupsResult struct {
	signups []domain.AudienceMember
	err     error
}

type commentsResult struct {
	comments []domain.Feedback
	err      error
}

type reactionsResult struct {
	reactions []domain.IdeaReaction
	err       error
}

type DashboardIdeaSpecs struct {
	WithMVP       bool
	WithAnalytics bool
}

const (
	MAX_ANALYTICS_DATA  = 5
	MAX_RECENT_ACTIVITY = 5
)

func NewDashboardService(repo repository.IdeaRepository, mvpRepo repository.MVPRepository, feedbackRepo repository.FeedbackRepository, signalRepo repository.SignalRepository,
	audienceRepo repository.AudienceRepository, reactionRepo repository.ReactionRepository) *dashboardService {
	return &dashboardService{
		repo:         repo,
		mvpRepo:      mvpRepo,
		feedbackRepo: feedbackRepo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
		reactionRepo: reactionRepo,
	}
}

func (s *dashboardService) GetDashboardData(ctx context.Context, userID string) (*response.DashboardResponse, error) {
	// Get current time and time range
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, -1, 0)
	sevenDaysAgo := now.AddDate(0, 0, -7)

	dashboardData := &response.DashboardResponse{}

	userIdeas, _, err := s.repo.GetIdeas(ctx, domain.QueryParams{}, repository.IdeaQuerySpec{
		WithCounts: true,
		ByUserId:   userID,
	})
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

	return dashboardData, nil
}

func (s *dashboardService) GetIdea(ctx context.Context, id uuid.UUID, userId string, specs DashboardIdeaSpecs) (*response.DashboardIdeaResponse, error) {
	getRelatedIdeas := false
	rawIdea, _, err := s.repo.GetByID(ctx, id, &getRelatedIdeas)
	if err != nil {
		return nil, fmt.Errorf("failed to get idea by ID: %w", err)
	}

	var analyticsData response.AnalyticsData
	var mvp domain.MVPSimulator

	if specs.WithAnalytics {
		now := time.Now()
		thirtyDaysAgo := now.AddDate(0, -1, 0)
		_analyticsData, err := s.getAnalyticsData(ctx, thirtyDaysAgo, now, []*domain.Idea{rawIdea})
		if err != nil {
			return nil, fmt.Errorf("failed to get analytics data: %w", err)
		}

		analyticsData = _analyticsData[0]
	}

	if specs.WithMVP {
		_mvp, err := s.mvpRepo.GetByIdea(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("failed to get MVP data: %w", err)
		}

		if _mvp != nil {
			mvp = *_mvp
			mvp.HTMLContent = "" // no need to pass html to dashboard
		}
	}

	return &response.DashboardIdeaResponse{
		Idea:          *rawIdea,
		AnalyticsData: analyticsData,
		MVP:           mvp,
	}, nil
}

func (s *dashboardService) GetAudienceForFounder(ctx context.Context, founderId string, withStats bool, queryParams domain.QueryParams) (response.AudienceResponse, error) {
	audienceMembersDomain, total, err := s.audienceRepo.GetForFounder(ctx, founderId, queryParams)
	if err != nil {
		return response.AudienceResponse{}, err
	}

	audiencesDto := make([]*response.Audience, 0, len(audienceMembersDomain))
	for _, am := range audienceMembersDomain {
		audiencesDto = append(audiencesDto, &response.Audience{
			UserID:     am.UserID,
			IdeaID:     am.IdeaID,
			IdeaTitle:  am.Idea.Title,
			SignupTime: am.SignupTime.Format(time.RFC3339), // standard time format
		})
	}

	audienceStats := &response.AudienceStats{}
	var metrics []response.AudienceMetrics

	if withStats {
		_ideas := make(map[string]*domain.Idea)
		for _, audience := range audienceMembersDomain {
			_ideas[audience.IdeaID.String()] = nil
		}

		userIdeas, _, err := s.repo.GetIdeas(ctx, domain.QueryParams{}, repository.IdeaQuerySpec{
			ByUserId:   founderId,
			WithCounts: true,
		})
		if err != nil {
			// This error is from fetching userIdeas, which is critical.
			fmt.Printf("Failed to get dashboard prerequisites: %v\n", err)
			return response.AudienceResponse{}, err
		}

		ideaTitlesMap := make(map[string]string)
		signupsByIdeaTitle := make(map[string]int64)
		for _, i := range userIdeas {
			ideaTitlesMap[i.ID.String()] = i.Title

			title := "Unknown Idea" // Default title
			if i.Title != "" {
				title = i.Title
			}
			signupsByIdeaTitle[title] = int64(i.Signups)
		}

		type tempIdeaMetric struct {
			Name  string
			Value int64
		}
		var allIdeaMetrics []tempIdeaMetric
		for name, value := range signupsByIdeaTitle {
			allIdeaMetrics = append(allIdeaMetrics, tempIdeaMetric{Name: name, Value: value})
		}

		sort.Slice(allIdeaMetrics, func(i, j int) bool {
			return allIdeaMetrics[i].Value > allIdeaMetrics[j].Value
		})

		if len(allIdeaMetrics) <= 3 {
			for _, m := range allIdeaMetrics {
				metrics = append(metrics, response.AudienceMetrics{IdeaTitle: m.Name, Count: m.Value})
			}
		} else {
			for i := 0; i < 3; i++ {
				metrics = append(metrics, response.AudienceMetrics{IdeaTitle: allIdeaMetrics[i].Name, Count: allIdeaMetrics[i].Value})
			}
			otherIdeasSignups := int64(0)
			for i := 3; i < len(allIdeaMetrics); i++ {
				otherIdeasSignups += allIdeaMetrics[i].Value
			}
			if otherIdeasSignups > 0 {
				metrics = append(metrics, response.AudienceMetrics{IdeaTitle: "Others", Count: otherIdeasSignups})
			}
		}

		now := time.Now()
		thirtyDaysAgo := now.AddDate(0, -1, 0)

		// activity data for current and previous periods
		currentPeriodIdeasWithActivity, err := s.repo.GetIdeasWithActivity(ctx, founderId, thirtyDaysAgo, now)
		if err != nil {
			return response.AudienceResponse{}, fmt.Errorf("failed to get current period ideas activity for stats: %w", err)
		}

		previousPeriodEnd := thirtyDaysAgo.Add(-time.Nanosecond)
		duration := now.Sub(thirtyDaysAgo)
		previousPeriodStart := thirtyDaysAgo.Add(-duration) // subtract the same duration for the previous period

		previousPeriodIdeasWithActivity, err := s.repo.GetIdeasWithActivity(ctx, founderId, previousPeriodStart, previousPeriodEnd)
		if err != nil {
			return response.AudienceResponse{}, fmt.Errorf("failed to get previous period ideas activity for stats: %w", err)
		}

		audienceStats = s.getAudienceStats(userIdeas, total, currentPeriodIdeasWithActivity, previousPeriodIdeasWithActivity)
	}

	return response.AudienceResponse{
		Audiences: audiencesDto,
		Stats:     audienceStats,
		Total:     total,
		Metrics:   metrics,
	}, nil
}

func (s *dashboardService) getAnalyticsMetrics(ctx context.Context, userID string, from, to time.Time, ideas []*domain.Idea) (response.Metrics, error) {
	currentPeriodIdeas, err := s.repo.GetIdeasWithActivity(ctx, userID, from, to)
	if err != nil {
		return response.Metrics{}, err
	}

	previousPeriodEnd := from.Add(-time.Nanosecond)
	previousPeriodStart := from.AddDate(0, 0, -int(to.Sub(from).Hours()/24))

	previousPeriodIdeas, err := s.repo.GetIdeasWithActivity(ctx, userID, previousPeriodStart, previousPeriodEnd)
	if err != nil {
		return response.Metrics{}, err
	}

	var totalGlobalSignupsAcrossAllIdeas int64
	for _, idea := range ideas {
		totalGlobalSignupsAcrossAllIdeas += int64(idea.Signups)
	}

	audienceStats := s.getAudienceStats(ideas, totalGlobalSignupsAcrossAllIdeas, currentPeriodIdeas, previousPeriodIdeas)

	metrics := response.Metrics{
		TotalSignups:     int(audienceStats.NewSubscribers),
		SignupsChange:    audienceStats.NewSubscribersChange,
		AvgConversion:    audienceStats.AverageConversionRate,
		ConversionChange: audienceStats.ConversionRateChange,
	}

	var ideasValidated int
	for _, idea := range currentPeriodIdeas {
		if idea.TargetSignups > 0 && idea.Signups >= idea.TargetSignups {
			ideasValidated++
		}
	}
	metrics.IdeasValidated = ideasValidated

	var prevIdeasValidated int
	for _, idea := range previousPeriodIdeas {
		if idea.TargetSignups > 0 && idea.Signups >= idea.TargetSignups {
			prevIdeasValidated++
		}
	}

	if prevIdeasValidated > 0 {
		metrics.IdeasChange = (float64(ideasValidated-prevIdeasValidated) / float64(prevIdeasValidated)) * 100
	} else if ideasValidated > 0 {
		metrics.IdeasChange = 100.0
	} else {
		metrics.IdeasChange = 0.0
	}

	if len(ideas) > 0 {
		metrics.AverageSignupsPerIdea = float64(totalGlobalSignupsAcrossAllIdeas) / float64(len(ideas))
	}

	return metrics, nil
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
	if len(ideas) > MAX_ANALYTICS_DATA {
		ideas = ideas[:MAX_ANALYTICS_DATA]
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

func (s *dashboardService) getAudienceStats(
	allUserIdeas []*domain.Idea,
	totalGlobalSubscribers int64,
	currentPeriodIdeasWithActivity []*response.IdeaWithActivity,
	previousPeriodIdeasWithActivity []*response.IdeaWithActivity,
) *response.AudienceStats {
	stats := &response.AudienceStats{
		TotalSubscribers: totalGlobalSubscribers,
	}

	var activeIdeas int64
	var currentPeriodSignups int
	var currentPeriodConversionRateSum float64
	var currentPeriodIdeasWithViews int

	for _, idea := range allUserIdeas {
		if idea.Status == string(domain.IdeaStatusActive) {
			activeIdeas++
		}
	}

	stats.ActiveIdeas = activeIdeas

	for _, idea := range currentPeriodIdeasWithActivity {
		currentPeriodSignups += idea.Signups // signups within the current period
		if idea.Views > 0 {
			currentPeriodConversionRateSum += float64(idea.Signups) / float64(idea.Views) * 100
			currentPeriodIdeasWithViews++
		}
	}
	stats.NewSubscribers = int64(currentPeriodSignups)

	if currentPeriodIdeasWithViews > 0 {
		stats.AverageConversionRate = currentPeriodConversionRateSum / float64(currentPeriodIdeasWithViews)
	}

	var previousPeriodSignups int
	var previousPeriodConversionRateSum float64
	var previousPeriodIdeasWithViews int

	for _, idea := range previousPeriodIdeasWithActivity {
		previousPeriodSignups += idea.Signups // signups in the previous period
		if idea.Views > 0 {
			previousPeriodConversionRateSum += float64(idea.Signups) / float64(idea.Views) * 100
			previousPeriodIdeasWithViews++
		}
	}

	// calculate NewSubscribersChange
	if previousPeriodSignups > 0 {
		stats.NewSubscribersChange = (float64(currentPeriodSignups-previousPeriodSignups) / float64(previousPeriodSignups)) * 100
	} else if currentPeriodSignups > 0 {
		stats.NewSubscribersChange = 100.0
	} else {
		stats.NewSubscribersChange = 0.0
	}

	var previousAvgConversionRate float64
	if previousPeriodIdeasWithViews > 0 {
		previousAvgConversionRate = previousPeriodConversionRateSum / float64(previousPeriodIdeasWithViews)
	}

	// calculate ConversionRateChange
	if previousAvgConversionRate > 0 {
		stats.ConversionRateChange = (stats.AverageConversionRate - previousAvgConversionRate) / previousAvgConversionRate * 100
	} else if stats.AverageConversionRate > 0 {
		stats.ConversionRateChange = 100.0
	} else {
		stats.ConversionRateChange = 0.0
	}

	return stats
}

func (s *dashboardService) GetRecentActivityForUser(
	ctx context.Context, userId string,
) ([]response.ActivityItem, error) {
	var activities []response.ActivityItem

	recentComments, recentSignals, recentSignups, recentReactions, err := s.getActivityPrerequisitesForUser(ctx, userId)
	if err != nil {
		log.Printf("Failed to get recent activity prerequisites: %v", err)
		return nil, fmt.Errorf("failed to get recent activity prerequisites: %w", err)
	}

	ideaIdSet := make(map[uuid.UUID]struct{})
	for _, signal := range recentSignals {
		ideaIdSet[signal.IdeaID] = struct{}{}
	}
	for _, signup := range recentSignups {
		ideaIdSet[signup.IdeaID] = struct{}{}
	}
	for _, comment := range recentComments {
		ideaIdSet[comment.IdeaID] = struct{}{}
	}
	for _, reaction := range recentReactions {
		ideaIdSet[reaction.IdeaID] = struct{}{}
	}

	var ideaIDsToFetch []uuid.UUID
	for id := range ideaIdSet {
		ideaIDsToFetch = append(ideaIDsToFetch, id)
	}

	ideas := make(map[uuid.UUID]*domain.Idea)
	if len(ideaIDsToFetch) > 0 {
		rawIdeas, fetchErr := s.repo.GetByIds(ctx, ideaIDsToFetch)
		if fetchErr != nil {
			log.Printf("WARN: Failed to fetch idea details for recent activity: %v", fetchErr)
			// Continue without titles
		} else {
			for _, idea := range rawIdeas {
				ideas[idea.ID] = idea
			}
		}
	}

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
		if idea, exists := ideas[signal.IdeaID]; exists {
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
		idea, exists := ideas[signup.IdeaID]
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

	for _, comment := range recentComments {
		ideaTitle := "Unknown Idea"
		if idea, exists := ideas[comment.IdeaID]; exists {
			ideaTitle = idea.Title
		}

		activities = append(activities, response.ActivityItem{
			ID:        comment.ID.String(),
			Type:      "comment",
			IdeaID:    comment.IdeaID.String(),
			IdeaTitle: ideaTitle,
			Message:   fmt.Sprintf("Someone commented on your idea: \"%s\"", pkg.TruncateComment(comment.Comment, 30)),
			Timestamp: comment.CreatedAt,
		})
	}

	for _, reaction := range recentReactions {
		ideaTitle := "Unknown Idea"
		if idea, exists := ideas[reaction.IdeaID]; exists {
			ideaTitle = idea.Title
		}

		var message string
		activityType := string(reaction.ReactionType)

		switch reaction.ReactionType {
		case string(request.LikeReaction):
			message = "Someone liked your idea"
		case string(request.DislikeReaction):
			message = "Someone disliked your idea"
		default:
			message = "Someone reacted to your idea"
			activityType = "reaction"
		}

		activities = append(activities, response.ActivityItem{
			ID:        reaction.ID.String(),
			Type:      activityType,
			IdeaID:    reaction.IdeaID.String(),
			IdeaTitle: ideaTitle,
			Message:   message,
			Timestamp: reaction.CreatedAt,
		})
	}

	sort.Slice(activities, func(i, j int) bool {
		return activities[i].Timestamp.After(activities[j].Timestamp)
	})

	if len(activities) > MAX_RECENT_ACTIVITY {
		activities = activities[:MAX_RECENT_ACTIVITY]
	}

	return activities, nil
}

// get signals, and signups concurrently
func (s *dashboardService) getActivityPrerequisitesForUser(ctx context.Context, userID string) (
	recentComments []domain.Feedback,
	recentSignals []domain.Signal,
	recentSignups []domain.AudienceMember,
	recentReactions []domain.IdeaReaction,
	err error,
) {
	var wg sync.WaitGroup

	signalsCh := make(chan signalsResult, 1)
	signupsCh := make(chan signupsResult, 1)
	commentsCh := make(chan commentsResult, 1)
	reactionsCh := make(chan reactionsResult, 1)

	wg.Add(4)

	go func() {
		defer wg.Done()
		signals, fetchErr := s.signalRepo.GetRecentByUserIdeas(ctx, userID, MAX_RECENT_ACTIVITY)
		signalsCh <- signalsResult{signals: signals, err: fetchErr}
	}()

	go func() {
		defer wg.Done()
		signups, fetchErr := s.audienceRepo.GetRecentByUserIdeas(ctx, userID, MAX_RECENT_ACTIVITY)
		signupsCh <- signupsResult{signups: signups, err: fetchErr}
	}()

	go func() {
		defer wg.Done()
		comments, fetchErr := s.feedbackRepo.GetForUser(ctx, userID, MAX_RECENT_ACTIVITY)
		commentsCh <- commentsResult{comments: comments, err: fetchErr}
	}()

	go func() {
		defer wg.Done()
		reactions, fetchErr := s.reactionRepo.GetRecentIdeaReactionsForUser(ctx, userID, MAX_RECENT_ACTIVITY)
		reactionsCh <- reactionsResult{reactions: reactions, err: fetchErr}
	}()

	wg.Wait()
	close(signalsCh)
	close(signupsCh)
	close(commentsCh)
	close(reactionsCh)

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

	commentsRes := <-commentsCh
	if commentsRes.err != nil {
		log.Printf("WARN: Failed to get recent comments for dashboard: %v", commentsRes.err)
		// Non-critical, can proceed with nil comments
	}
	recentComments = commentsRes.comments

	reactionsRes := <-reactionsCh
	if reactionsRes.err != nil {
		log.Printf("WARN: Failed to get recent reactions for dashboard: %v", reactionsRes.err)
		// Non-critical, can proceed with nil reactions
	}
	recentReactions = reactionsRes.reactions

	return recentComments, recentSignals, recentSignups, recentReactions, nil
}
