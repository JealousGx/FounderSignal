package service

import (
	"context"
	"errors"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"time"

	"github.com/google/uuid"
)

type ReportService interface {
	GenerateReports(ctx context.Context, userId string, req request.GenerateReportRequest) error
	GetReportsList(ctx context.Context, userID string, queryParams domain.QueryParams, specs ReportSpecs) (*response.ReportListResponse, error)
	// GetReportByID(ctx context.Context, reportID uuid.UUID) (*domain.Report, error)
	// GetReportsForIdea(ctx context.Context, ideaID uuid.UUID) ([]domain.Report, error)
}

type ReportSpecs struct {
	WithStats bool
}

type reportService struct {
	repo      repository.ReportRepository
	ideaRepo  repository.IdeaRepository
	analytics AnalyticsService
}

func NewReportService(reportRepo repository.ReportRepository, ideaRepository repository.IdeaRepository, analyticsService AnalyticsService) *reportService {
	return &reportService{
		repo:      reportRepo,
		ideaRepo:  ideaRepository,
		analytics: analyticsService,
	}
}

func (s *reportService) GenerateReports(ctx context.Context, userId string, req request.GenerateReportRequest) error {
	var ideas []*domain.Idea

	if req.IdeaID != uuid.Nil {
		idea, _, err := s.ideaRepo.GetByID(ctx, req.IdeaID, nil)
		if err != nil {
			return fmt.Errorf("failed to get idea: %w", err)
		}
		ideas = append(ideas, idea)
	} else if req.IdeaStatus != "" {
		var err error
		_ideas, _, err := s.ideaRepo.GetIdeas(ctx, domain.QueryParams{}, repository.IdeaQuerySpec{Status: req.IdeaStatus, ByUserId: userId})
		if err != nil {
			fmt.Println("Error fetching ideas:", err)
			return fmt.Errorf("failed to get ideas: %w", err)
		}

		ideas = _ideas
	} else {
		return errors.New("either Idea ID or By Idea Status is required")
	}

	for _, idea := range ideas {
		reportId, err := s.GenerateReport(ctx, userId, idea, req.Type)
		if err != nil {
			return fmt.Errorf("failed to generate report: %w", err)
		}

		if reportId != nil {
			fmt.Printf("Report generated with ID: %s\n", reportId.String())
		} else {
			fmt.Println("No new report generated.")
		}
	}

	return nil
}

func (s *reportService) GetReportsList(ctx context.Context, userID string, queryParams domain.QueryParams, specs ReportSpecs) (*response.ReportListResponse, error) {
	userReports, total, err := s.repo.GetForUser(ctx, userID, queryParams)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch reports: %w", err)
	}

	res := dto.ToReportListResponse(userReports)

	if specs.WithStats {
		reports, _, err := s.repo.GetAll(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch reports: %w", err)
		}

		overview, successData, err := s.analytics.GetReportsOverview(ctx, userID, reports)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch reports overview: %w", err)
		}

		var conversionData []response.ReportsConversionData
		for _, report := range reports {

			conversionData = append(conversionData, response.ReportsConversionData{
				Title:          report.Idea.Title,
				ConversionRate: dto.CalculateConversionRate(int(report.Signups), int(report.Views)),
				ID:             report.ID,
			})
		}

		numRecentInsightsToTake := 3
		if len(reports) < numRecentInsightsToTake {
			numRecentInsightsToTake = len(reports)
		}
		res.RecentInsights = dto.ToReportsResponse(reports[:numRecentInsightsToTake])

		res.Overview = *overview
		res.ConversionData = conversionData
		res.SuccessData = successData
	}

	res.Total = total
	return &res, nil
}

func (s *reportService) GenerateReport(ctx context.Context, userId string, idea *domain.Idea, reportType domain.ReportType) (*uuid.UUID, error) {
	date := time.Now()
	var startDate time.Time
	var endDate time.Time = date

	switch reportType {
	case domain.ReportTypeWeekly:
		startDate = date.AddDate(0, 0, -7)
	case domain.ReportTypeMonthly:
		startDate = date.AddDate(0, -1, 0)
	case domain.ReportTypeMilestone:
		// For milestone reports, use the last 2 weeks
		startDate = date.AddDate(0, 0, -14)
	case domain.ReportTypeFinal:
		// For final reports, use all available data
		startDate = idea.CreatedAt
	default:
		return nil, errors.New("invalid report type")
	}

	// Check if a similar report was already generated recently
	existingReport, err := s.repo.GetReportByTypeAndTimeRange(ctx, idea.ID, reportType, startDate, endDate)
	if err != nil {
		return nil, errors.New("failed to check for existing report")
	}

	// If a similar report already exists, return an error
	if existingReport != nil {
		reportId := existingReport.ID
		return &reportId, nil
	}

	report := &domain.Report{
		IdeaID: idea.ID,
		Date:   time.Now(),
		Type:   reportType,
	}

	analytics, err := s.analytics.GetIdeaReportAnalytics(ctx, idea.ID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	conversionRate := 0.0
	if analytics.Views > 0 {
		conversionRate = (float64(analytics.Signups) / float64(analytics.Views)) * 100
	}

	isValidated := s.isReportValidated(report, conversionRate, idea.TargetSignups)
	report.Validated = isValidated

	report.Views = analytics.Views
	report.Signups = analytics.Signups
	report.Sentiment = analytics.Sentiment

	if err := s.repo.Create(ctx, report); err != nil {
		return nil, err
	}

	reportId := report.ID

	return &reportId, nil
}

func (s *reportService) isReportValidated(report *domain.Report, conversionRate float64, targetSignups int) bool {
	var minSignups int64
	var minConversionRate float64

	switch report.Type {
	case domain.ReportTypeWeekly:
		minSignups = int64(targetSignups / 3)
		minConversionRate = 25.0
	case domain.ReportTypeMonthly:
		minSignups = int64(targetSignups / 2)
		minConversionRate = 50.0
	case domain.ReportTypeMilestone:
		minSignups = int64(targetSignups)
		minConversionRate = 100.0
	case domain.ReportTypeFinal:
		minSignups = int64(targetSignups * 2)
		minConversionRate = 200.0
	}

	return report.Signups >= minSignups && conversionRate >= minConversionRate
}
