package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"time"

	"github.com/google/uuid"
)

type AnalyticsData struct {
	Views          int64
	Signups        int64
	Sentiment      float64
	EngagementRate float64
}

type AnalyticsService interface {
	GetIdeaReportAnalytics(ctx context.Context, ideaID uuid.UUID, startDate, endDate time.Time) (*AnalyticsData, error)
	GetReportsOverview(ctx context.Context, userId string, reports []domain.Report) (*response.ReportsOverview, []response.NameValueData, error)
	GetReportOverview(ctx context.Context, report *domain.Report) (*[]response.ReportPerformanceOverview, *response.ReportSignupsTimeline, error)
}

type analyticsService struct {
	ideaRepo     repository.IdeaRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository
	fbRepo       repository.FeedbackRepository
	reportRepo   repository.ReportRepository
}

func NewAnalyticsService(ideaRepository repository.IdeaRepository, signalRepo repository.SignalRepository, audienceRepo repository.AudienceRepository, fbRepo repository.FeedbackRepository, reportRepo repository.ReportRepository) *analyticsService {
	return &analyticsService{
		ideaRepo:     ideaRepository,
		fbRepo:       fbRepo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
		reportRepo:   reportRepo,
	}
}

func (s *analyticsService) GetIdeaReportAnalytics(ctx context.Context, ideaID uuid.UUID, startDate, endDate time.Time) (*AnalyticsData, error) {
	allSignals, err := s.signalRepo.GetByIdeaWithTimeRange(ctx, ideaID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch signals for analytics: %w", err)
	}

	var pageViewsCount int64

	type sessionActivity struct {
		hasPageview    bool
		hasInteraction bool
	}
	sessions := make(map[string]*sessionActivity)

	for _, signal := range allSignals {
		if signal.EventType == string(domain.EventTypePageView) {
			pageViewsCount++
		}

		var sessionKey string
		if signal.UserID != "" {
			sessionKey = signal.UserID
		} else {
			sessionKey = "anon_" + signal.IPAddress + "_" + signal.UserAgent
		}

		if _, ok := sessions[sessionKey]; !ok {
			sessions[sessionKey] = &sessionActivity{}
		}
		currentSessionActivity := sessions[sessionKey]

		isInteractionEvent := false
		switch signal.EventType {
		case string(domain.EventTypePageView):
			currentSessionActivity.hasPageview = true
		case string(domain.EventTypeClick):
			isInteractionEvent = true
		case string(domain.EventTypeScroll):
			var meta struct {
				Percentage int `json:"percentage"`
			}
			if signal.Metadata != nil {
				if err := json.Unmarshal(signal.Metadata, &meta); err == nil {
					if meta.Percentage > 10 { // lets assume user-interaction if scrolled more than 10%
						isInteractionEvent = true
					}
				}
			}
		case string(domain.EventTypeTimeOnPage):
			var meta struct {
				DurationSeconds int `json:"duration_seconds"`
			}
			if signal.Metadata != nil {
				if err := json.Unmarshal(signal.Metadata, &meta); err == nil {
					if meta.DurationSeconds > 5 { // lets assume user-interaction if time on page > 5 seconds
						isInteractionEvent = true
					}
				}
			}
		}

		if isInteractionEvent {
			currentSessionActivity.hasInteraction = true
		}
	}

	var totalSessionsWithPageview int
	var engagedSessionsCount int
	for _, activity := range sessions {
		if activity.hasPageview {
			totalSessionsWithPageview++
			if activity.hasInteraction {
				engagedSessionsCount++
			}
		}
	}

	var engagementRate float64
	if totalSessionsWithPageview > 0 {
		engagementRate = (float64(engagedSessionsCount) / float64(totalSessionsWithPageview)) * 100.0
	}

	// Fetch signup count for the time period
	signups, err := s.audienceRepo.GetCountByIdeaId(ctx, ideaID, &startDate, &endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch signups: %w", err)
	}

	feedbacks, err := s.fbRepo.GetByIdeaWithTimeRange(ctx, ideaID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch feedback: %w", err)
	}

	totalSentiment := 0.0
	feedbackCount := len(feedbacks)
	for _, fb := range feedbacks {
		totalSentiment += fb.SentimentScore
	}

	sentiment := 0.0
	if feedbackCount > 0 {
		sentiment = totalSentiment / float64(feedbackCount)
	}

	return &AnalyticsData{
		Views:          pageViewsCount,
		Signups:        signups,
		Sentiment:      sentiment,
		EngagementRate: engagementRate,
	}, nil
}

func (s *analyticsService) GetReportsOverview(ctx context.Context, userId string, reports []domain.Report) (*response.ReportsOverview, []response.NameValueData, error) {
	total := int64(len(reports))

	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	previousMonthStart := currentMonthStart.AddDate(0, -1, 0)

	var totalSignupsAllTime int64
	var totalViewsAllTime int64
	var totalSentimentSumAllTime float64
	var totalValidatedAllTime int64

	var signupsCurrentMonth int64
	var viewsCurrentMonth int64
	var sentimentSumCurrentMonth float64
	var reportsCountCurrentMonth int

	var signupsPreviousMonth int64
	var viewsPreviousMonth int64
	var sentimentSumPreviousMonth float64
	var reportsCountPreviousMonth int

	for _, report := range reports {
		// All-time totals
		totalSignupsAllTime += int64(report.Signups)
		totalViewsAllTime += int64(report.Views)
		totalSentimentSumAllTime += report.Sentiment
		if report.Validated {
			totalValidatedAllTime++
		}

		// Current month
		if !report.Date.Before(currentMonthStart) { // Report date is on or after current month start
			signupsCurrentMonth += int64(report.Signups)
			viewsCurrentMonth += int64(report.Views)
			sentimentSumCurrentMonth += report.Sentiment
			reportsCountCurrentMonth++
		}

		// Previous month
		if !report.Date.Before(previousMonthStart) && report.Date.Before(currentMonthStart) { // Report date is within previous month
			signupsPreviousMonth += int64(report.Signups)
			viewsPreviousMonth += int64(report.Views)
			sentimentSumPreviousMonth += report.Sentiment
			reportsCountPreviousMonth++
		}
	}

	avgSentimentAllTime := 0.0
	if total > 0 {
		avgSentimentAllTime = totalSentimentSumAllTime / float64(total)
	}

	successRateAllTime := 0.0
	if total > 0 {
		successRateAllTime = float64(totalValidatedAllTime) / float64(total) * 100.0
	}

	avgSentimentCurrentMonth := 0.0
	if reportsCountCurrentMonth > 0 {
		avgSentimentCurrentMonth = sentimentSumCurrentMonth / float64(reportsCountCurrentMonth)
	}

	avgSentimentPreviousMonth := 0.0
	if reportsCountPreviousMonth > 0 {
		avgSentimentPreviousMonth = sentimentSumPreviousMonth / float64(reportsCountPreviousMonth)
	}

	totalSignupsChange := calculatePercentageChange(float64(signupsCurrentMonth), float64(signupsPreviousMonth))
	totalViewsChange := calculatePercentageChange(float64(viewsCurrentMonth), float64(viewsPreviousMonth))
	avgSentimentChange := calculatePercentageChange(avgSentimentCurrentMonth, avgSentimentPreviousMonth)

	totalNotValidated := total - totalValidatedAllTime
	successData := []response.NameValueData{
		{
			Name:  "Validated",
			Total: totalValidatedAllTime,
		},
		{
			Name:  "Not Validated",
			Total: totalNotValidated,
		},
	}

	overview := response.ReportsOverview{
		TotalSignups:       totalSignupsAllTime,
		TotalViews:         totalViewsAllTime,
		AvgSentiment:       avgSentimentAllTime,
		TotalSignupsChange: totalSignupsChange,
		TotalViewsChange:   totalViewsChange,
		AvgSentimentChange: avgSentimentChange,
		SuccessRate:        successRateAllTime,
	}

	return &overview, successData, nil
}

func (s *analyticsService) GetReportOverview(ctx context.Context, report *domain.Report) (*[]response.ReportPerformanceOverview, *response.ReportSignupsTimeline, error) {
	overview := []response.ReportPerformanceOverview{}
	timeline := response.ReportSignupsTimeline{
		DailySignups:  []response.NameValueData{},
		WeeklySignups: []response.NameValueData{},
	}

	ideaId := report.IdeaID

	var startDate time.Time
	reportType := report.Type
	excludeReportID := report.ID
	previousReport, err := s.reportRepo.GetLatest(ctx, report.IdeaID, &reportType, &excludeReportID)
	if err != nil {
		fmt.Printf("Error fetching previous report for GetReportOverview (IdeaID: %s, Type: %s, ReportID: %s): %v. Falling back to idea creation date.\n", report.IdeaID, report.Type, report.ID, err)

		startDate = report.Idea.CreatedAt
	} else if previousReport != nil {
		startDate = previousReport.Date
	} else {
		startDate = report.Idea.CreatedAt
	}

	endDate := report.Date

	if startDate.After(endDate) {
		// This could happen if data is inconsistent or report dates are very close.
		// Set startDate to endDate to avoid negative duration. Analytics calls should handle this.
		startDate = endDate
	}

	dailyViews, err := s.signalRepo.GetDailyViewsByIdeaIDs(ctx, []uuid.UUID{ideaId}, startDate, endDate)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch views for report overview: %w", err)
	}

	dailySignups, err := s.audienceRepo.GetSignupsByIdeaIds(ctx, []uuid.UUID{ideaId}, startDate, endDate)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch signups for report overview: %w", err)
	}

	currentDay := startDate
	for !currentDay.After(endDate) { // iterate from startDate to endDate
		// Daily signups & views

		year, month, day := currentDay.Date()
		mapLookupKeyTime := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
		dayStr := mapLookupKeyTime.Format(time.RFC3339) // Standard date format for map keys
		formattedDate := currentDay.Format("Jan 02")    // For display

		var views int64
		if ideaViewsMap, ok := dailyViews[ideaId]; ok {
			if v, okDate := ideaViewsMap[dayStr]; okDate {
				views = int64(v)
			}
		}

		var signups int64
		if ideaSignupsMap, ok := dailySignups[ideaId]; ok {
			if s, okDate := ideaSignupsMap[dayStr]; okDate {
				signups = int64(s)
			}
		}

		overview = append(overview, response.ReportPerformanceOverview{
			Date:    formattedDate,
			Views:   views,
			Signups: signups,
		})

		timeline.DailySignups = append(timeline.DailySignups, response.NameValueData{
			Name:  formattedDate,
			Total: signups,
		})

		currentDay = currentDay.AddDate(0, 0, 1)
	}

	currentWeek := startDate
	for !currentWeek.After(endDate) {
		// weekly signups

		weekEndDate := currentWeek.AddDate(0, 0, 6) // End of a 7-day block
		if weekEndDate.After(endDate) {
			weekEndDate = endDate // Cap at the overall endDate
		}

		var totalWeeklySignups int64
		dayInWeekIterator := currentWeek
		// Iterate through the week to sum up signups
		for !dayInWeekIterator.After(weekEndDate) {
			year, month, day := dayInWeekIterator.Date()
			mapLookupKeyTime := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
			dayStr := mapLookupKeyTime.Format(time.RFC3339)

			if ideaSignupsMap, ok := dailySignups[ideaId]; ok {
				if s, okDate := ideaSignupsMap[dayStr]; okDate {
					totalWeeklySignups += int64(s)
				}
			}
			dayInWeekIterator = dayInWeekIterator.AddDate(0, 0, 1)
		}

		// Format week name for display
		var weekName string
		if currentWeek.Format("Jan 02") == weekEndDate.Format("Jan 02") { // Single day week
			weekName = currentWeek.Format("Jan 02, 2006")
		} else {
			weekName = fmt.Sprintf("%s - %s", currentWeek.Format("Jan 02"), weekEndDate.Format("Jan 02, 2006"))
		}

		timeline.WeeklySignups = append(timeline.WeeklySignups, response.NameValueData{
			Name:  weekName,
			Total: totalWeeklySignups,
		})

		currentWeek = currentWeek.AddDate(0, 0, 7)

	}

	return &overview, &timeline, nil
}

func calculatePercentageChange(current, previous float64) float64 {
	if previous == 0 {
		if current > 0 {
			return 100.0
		}

		return 0.0
	}

	return ((current - previous) / previous) * 100.0
}
