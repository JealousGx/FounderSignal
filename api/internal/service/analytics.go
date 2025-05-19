package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"time"

	"github.com/google/uuid"
)

type AnalyticsData struct {
	Views     int64
	Signups   int64
	Sentiment float64
}

type AnalyticsService interface {
	GetIdeaReportAnalytics(ctx context.Context, ideaID uuid.UUID, startDate, endDate time.Time) (*AnalyticsData, error)
	GetReportsOverview(ctx context.Context, userId string, reports []domain.Report) (*response.ReportsOverview, []response.ReportsSuccessData, error)
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
	// Fetch signal data for the time period
	eventType := domain.EventTypePageView
	views, err := s.signalRepo.GetCountByIdeaId(ctx, ideaID, &eventType, &startDate, &endDate, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch signals: %w", err)
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
		Views:     views,
		Signups:   signups,
		Sentiment: sentiment,
	}, nil
}

func (s *analyticsService) GetReportsOverview(ctx context.Context, userId string, reports []domain.Report) (*response.ReportsOverview, []response.ReportsSuccessData, error) {
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

	avgSentimentAllTime := totalSentimentSumAllTime / float64(total)
	successRateAllTime := float64(totalValidatedAllTime) / float64(total) * 100.0

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
	successData := []response.ReportsSuccessData{
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

func calculatePercentageChange(current, previous float64) float64 {
	if previous == 0 {
		if current > 0 {
			return 100.0
		}

		return 0.0
	}

	return ((current - previous) / previous) * 100.0
}
