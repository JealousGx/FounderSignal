package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ReportService interface {
	GenerateReports(ctx context.Context, userId string, req request.GenerateReportRequest) error
	GetReportsList(ctx context.Context, userID string, queryParams domain.QueryParams, specs ReportSpecs) (*response.ReportListResponse, error)
	GetByID(ctx context.Context, reportId uuid.UUID) (*response.ReportPageResponse, error)
	// GetReportsForIdea(ctx context.Context, ideaID uuid.UUID) ([]domain.Report, error) // to be implemented later

	// SubmitContentReport sends a report, either for an idea or a comment, to the system for review.
	SubmitContentReport(ctx context.Context, reporterId string, req request.CreateContentReport) error
	SubmitFeatureRequest(ctx context.Context, userId string, req request.CreateFeatureRequest) error
	SubmitBugReport(ctx context.Context, reporterId string, req request.CreateBugReport) error
}

type ReportSpecs struct {
	WithStats bool
}

type reportService struct {
	repo         repository.ReportRepository
	ideaRepo     repository.IdeaRepository
	feedbackRepo repository.FeedbackRepository
	activityRepo repository.ActivityRepository
	analytics    AnalyticsService
	broadcaster  websocket.ActivityBroadcaster

	ReportConfig ReportServiceConfig
}

type DiscordWebhookPayload struct {
	Embeds []DiscordEmbed `json:"embeds"`
}

type DiscordEmbed struct {
	Title       string         `json:"title"`
	Description string         `json:"description"`
	URL         string         `json:"url"`
	Color       int            `json:"color"` // e.g., 15158332 for red
	Fields      []DiscordField `json:"fields"`
	Footer      DiscordFooter  `json:"footer"`
}

type DiscordField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline,omitempty"`
}

type DiscordFooter struct {
	Text string `json:"text"`
}

type ReportServiceConfig struct {
	DiscordContentReportWebhookURL      string // Specific webhook for content reports
	DiscordBugReportWebhookURL          string // Specific webhook for bug reports
	DiscordFeatureSuggestionsWebhookURL string // Specific webhook for feature suggestions
	Environment                         string // Environment (e.g., "development", "production") to control logging and behavior
}

func NewReportService(reportRepo repository.ReportRepository, ideaRepository repository.IdeaRepository, feedbackRepo repository.FeedbackRepository,
	activityRepo repository.ActivityRepository, analyticsService AnalyticsService, broadcaster websocket.ActivityBroadcaster,
	cfg ReportServiceConfig) *reportService {
	return &reportService{
		repo:         reportRepo,
		ideaRepo:     ideaRepository,
		feedbackRepo: feedbackRepo,
		activityRepo: activityRepo,
		analytics:    analyticsService,
		broadcaster:  broadcaster,
		ReportConfig: cfg,
	}
}

func (s *reportService) GenerateReports(ctx context.Context, userId string, req request.GenerateReportRequest) error {
	var ideas []*domain.Idea

	if req.IdeaID != uuid.Nil {
		idea, _, err := s.ideaRepo.GetByID(ctx, req.IdeaID, nil, nil)
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
			fmt.Println("Error fetching all reports:", err)
			return nil, fmt.Errorf("failed to fetch reports: %w", err)
		}

		overview, successData, err := s.analytics.GetReportsOverview(ctx, userID, reports)
		if err != nil {
			fmt.Println("Error calculating analytics for the reports:", err)
			return nil, fmt.Errorf("failed to fetch reports overview: %w", err)
		}

		var conversionData []response.ReportsConversionData
		for _, report := range reports {

			conversionData = append(conversionData, response.ReportsConversionData{
				Title:          report.Idea.Title,
				ConversionRate: dto.CalculateConversionRate(int(report.Views), int(report.Signups)),
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

func (s *reportService) GetByID(ctx context.Context, reportId uuid.UUID) (*response.ReportPageResponse, error) {
	report, err := s.repo.GetByID(ctx, reportId)
	if err != nil {
		return nil, fmt.Errorf("failed to get report: %w", err)
	}

	thresholds := s.getValidationThresholds(report, report.Idea.TargetSignups)
	res := dto.ToReportPageResponse(report, thresholds)

	overview, timeline, err := s.analytics.GetReportOverview(ctx, report)
	if err != nil {
		return nil, fmt.Errorf("error calculating analytics for the report: %w", err)
	}

	res.PerformanceOverview = *overview
	res.SignupsTimeline = *timeline

	return &res, nil
}

func (s *reportService) GenerateReport(ctx context.Context, userId string, idea *domain.Idea, reportType domain.ReportType) (*uuid.UUID, error) {
	now := time.Now()

	year, month, day := now.Date()
	todayStart := time.Date(year, month, day, 0, 0, 0, 0, now.Location())
	todayEnd := time.Date(year, month, day, 23, 59, 59, int(time.Second-time.Nanosecond), now.Location())

	// Check if a similar report was already generated recently
	existingReport, existingReportErr := s.repo.GetReportByTypeAndTimeRange(ctx, idea.ID, reportType, todayStart, todayEnd)
	if existingReportErr != nil {
		return nil, errors.New("failed to check for existing report")
	}

	// If a similar report already exists, return an error
	if existingReport != nil {
		reportId := existingReport.ID
		return &reportId, nil
	}

	date := now
	var startDate time.Time
	var endDate time.Time = date

	var lastReport *domain.Report
	var err error

	if reportType == domain.ReportTypeWeekly || reportType == domain.ReportTypeMonthly {
		lastReport, err = s.repo.GetLatest(ctx, idea.ID, &reportType, nil)
		if err != nil {
			fmt.Println("Error fetching last report:", err)
		}
	}

	switch reportType {
	case domain.ReportTypeWeekly:
		if lastReport != nil {
			startDate = lastReport.Date // from the date of the last report
		} else {
			startDate = idea.CreatedAt
		}
	case domain.ReportTypeMonthly:
		if lastReport != nil {
			startDate = lastReport.Date
		} else {
			startDate = idea.CreatedAt
		}
	case domain.ReportTypeMilestone:
		if lastReport != nil {
			// For milestone reports, use the last 2 weeks
			startDate = date.AddDate(0, 0, -14)
		} else {
			startDate = idea.CreatedAt
		}
	case domain.ReportTypeFinal:
		// For final reports, use all available data
		startDate = idea.CreatedAt
	default:
		return nil, errors.New("invalid report type")
	}

	if startDate.After(endDate) {
		return nil, errors.New("too soon to generate report for this idea")
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

	conversionRate := dto.CalculateConversionRate(int(analytics.Views), int(analytics.Signups))

	report.Validated = s.isReportValidated(report, conversionRate, idea.TargetSignups)
	report.Views = analytics.Views
	report.Signups = analytics.Signups
	report.Sentiment = analytics.Sentiment
	report.EngagementRate = analytics.EngagementRate

	if err := s.repo.Create(ctx, report); err != nil {
		return nil, err
	}

	reportId := report.ID

	return &reportId, nil
}

func (s *reportService) SubmitContentReport(ctx context.Context, reporterId string, req request.CreateContentReport) error {
	var idea *domain.Idea
	var err error

	contentId, err := uuid.Parse(req.ContentID)
	if err != nil {
		return fmt.Errorf("invalid content ID: %w", err)
	}

	switch req.ContentType {
	case "idea":
		idea, _, err = s.ideaRepo.GetByID(ctx, contentId, nil, nil)
		if err != nil {
			return fmt.Errorf("failed to get idea: %w", err)
		}

	case "comment":
		feedback, err := s.feedbackRepo.GetById(ctx, contentId)
		if err != nil {
			return fmt.Errorf("failed to get feedback: %w", err)
		}
		if feedback != nil {
			idea, _, err = s.ideaRepo.GetByID(ctx, feedback.IdeaID, nil, nil)
			if err != nil {
				return fmt.Errorf("failed to get idea from feedback: %w", err)
			}
		}
	default:
		log.Printf("WARN: Unsupported content type '%s' for report submission", req.ContentType)
	}

	if idea != nil && idea.UserID != "" {

		var baseMessage string
		switch req.ContentType {
		case "idea":
			baseMessage = fmt.Sprintf("Your idea '%s' has been reported.", idea.Title)
		case "comment":
			baseMessage = fmt.Sprintf("A comment on your idea '%s' has been reported.", idea.Title)
		default:
			baseMessage = fmt.Sprintf("Content related to your idea '%s' was reported.", idea.Title)
		}

		message := fmt.Sprintf("%s Reason: %s", baseMessage, req.Reason)

		// Notify the idea creator
		activity := &domain.Activity{
			UserID:       idea.UserID,
			IdeaID:       idea.ID,
			Message:      message,
			Type:         domain.ActivityTypeContentReported,
			ReferenceID:  req.ContentID,
			ReferenceURL: req.ContentURL,
		}
		if reporterId != "" {
			activity.TriggeredBy = &reporterId
		}

		if err := s.activityRepo.Create(ctx, activity); err != nil {
			log.Printf("ERROR: Failed to create activity for content report: %v", err)
			// Do not fail the whole operation, just log the error
		}

		s.broadcaster.FormatAndBroadcastContentReport(idea.UserID, *activity, idea.Title)
	} else {
		log.Printf("WARN: Could not find associated idea or idea creator for content report on content %s", req.ContentID)
	}

	if s.ReportConfig.DiscordContentReportWebhookURL == "" {
		log.Println("WARN: DISCORD_CONTENT_REPORT_WEBHOOK_URL is not set. Report notification will not be sent.")
		// Return nil because failing the user's request just because notifications are down isn't ideal.
		return nil
	}

	reporterField := DiscordField{
		Name: "Reporter", Value: "Anonymous", Inline: false,
	}

	if reporterId != "" {
		reporterField.Name = "Reporter User ID"
		reporterField.Value = reporterId
	}

	payload := DiscordWebhookPayload{
		Embeds: []DiscordEmbed{
			{
				Title:       fmt.Sprintf("[%s] New Content Report: %s", strings.ToUpper(s.ReportConfig.Environment), req.ContentType),
				Description: req.Reason,
				URL:         req.ContentURL,
				Color:       15158332, // Red
				Fields: []DiscordField{
					{Name: "Content Type", Value: req.ContentType, Inline: true},
					{Name: "Content ID", Value: req.ContentID, Inline: true},
					reporterField,
				},
				Footer: DiscordFooter{
					Text: fmt.Sprintf("Reported on %s", time.Now().Format(time.RFC1123)),
				},
			},
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("ERROR: Failed to marshal Discord payload: %v", err)
		return fmt.Errorf("internal server error when preparing report")
	}

	resp, err := http.Post(s.ReportConfig.DiscordContentReportWebhookURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Printf("ERROR: Failed to send Discord webhook: %v", err)
		return fmt.Errorf("failed to submit report")
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Printf("ERROR: Discord webhook returned status %d", resp.StatusCode)
		return fmt.Errorf("failed to submit report due to a webhook error")
	}

	return nil
}

func (s *reportService) SubmitFeatureRequest(ctx context.Context, userId string, req request.CreateFeatureRequest) error {
	webhookURL := s.ReportConfig.DiscordFeatureSuggestionsWebhookURL
	if webhookURL == "" {
		log.Println("WARN: DISCORD_FEATURE_SUGGESTIONS_WEBHOOK_URL is not set. Feature request notification will not be sent.")
		return nil
	}

	if userId == "" {
		userId = "Anonymous"
	}

	payload := DiscordWebhookPayload{
		Embeds: []DiscordEmbed{
			{
				Title:       fmt.Sprintf("[%s] New Feature Request", strings.ToUpper(s.ReportConfig.Environment)),
				Description: req.Description,
				Color:       3066993, // Green
				Fields: []DiscordField{
					{Name: "Title", Value: req.Title, Inline: true},
					{Name: "User ID", Value: userId, Inline: true},
				},
				Footer: DiscordFooter{
					Text: fmt.Sprintf("Requested on %s", time.Now().Format(time.RFC1123)),
				},
			},
		},
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("ERROR: Failed to marshal Discord payload: %v", err)
		return fmt.Errorf("internal server error when preparing feature request")
	}
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Printf("ERROR: Failed to send Discord webhook: %v", err)
		return fmt.Errorf("failed to submit feature request")
	}
	defer resp.Body.Close()

	return nil
}

func (s *reportService) SubmitBugReport(ctx context.Context, reporterId string, req request.CreateBugReport) error {
	webhookURL := s.ReportConfig.DiscordBugReportWebhookURL
	if webhookURL == "" {
		log.Println("WARN: DISCORD_BUG_REPORT_WEBHOOK_URL is not set. Bug report notification will not be sent.")
		return nil
	}

	reporterField := DiscordField{
		Name: "Reporter", Value: "Anonymous", Inline: false,
	}

	if reporterId != "" {
		reporterField.Name = "Reporter User ID"
		reporterField.Value = reporterId
	}

	payload := DiscordWebhookPayload{
		Embeds: []DiscordEmbed{
			{
				Title:       fmt.Sprintf("[%s] 🐞 New Bug Report", strings.ToUpper(s.ReportConfig.Environment)),
				Description: "**Description:**\n" + req.Description,
				URL:         req.PageURL,
				Color:       16711680, // Bright Red
				Fields: []DiscordField{
					{Name: "Steps to Reproduce", Value: req.StepsToReproduce, Inline: false},
					{Name: "Reported from URL", Value: req.PageURL, Inline: false},
					reporterField,
				},
				Footer: DiscordFooter{
					Text: fmt.Sprintf("Reported on %s", time.Now().Format(time.RFC1123)),
				},
			},
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("ERROR: Failed to marshal Discord payload for bug report: %v", err)
		return fmt.Errorf("internal server error when preparing bug report")
	}

	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Printf("ERROR: Failed to send Discord webhook for bug report: %v", err)
		return fmt.Errorf("failed to submit bug report")
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Printf("ERROR: Discord webhook for bug report returned status %d", resp.StatusCode)
		return fmt.Errorf("failed to submit bug report due to a webhook error")
	}

	return nil
}

func (s *reportService) isReportValidated(report *domain.Report, conversionRate float64, targetSignups int) bool {
	thresholds := s.getValidationThresholds(report, targetSignups)

	return report.Signups >= thresholds.Signups && conversionRate >= thresholds.ConversionRate
}

func (s *reportService) getValidationThresholds(report *domain.Report, targetSignups int) response.ReportValidationThreshold {
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

	return response.ReportValidationThreshold{
		Signups:        minSignups,
		ConversionRate: minConversionRate,
	}
}
