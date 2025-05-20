package response

import (
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
)

type ReportListResponse struct {
	Reports        []ReportResponse        `json:"reports"`
	Overview       ReportsOverview         `json:"overview"`
	ConversionData []ReportsConversionData `json:"conversionData"`
	SuccessData    []NameValueData         `json:"successData"`
	RecentInsights []ReportResponse        `json:"recentInsights"`
	Total          int64                   `json:"total"`
}

type ReportPageResponse struct {
	Report              ReportResponse              `json:"report"`
	PerformanceOverview []ReportPerformanceOverview `json:"overview"`
	SignupsTimeline     ReportSignupsTimeline       `json:"signupsTimeline"`
	ValidationThreshold ReportValidationThreshold   `json:"validationThreshold"`
	Insights            []string                    `json:"insights"`
}

type ReportIdea struct {
	ID    uuid.UUID `json:"id"`
	Title string    `json:"title"`
}

// ReportResponseDTO is the DTO for sending report data to the client.
type ReportResponse struct {
	ID              uuid.UUID         `json:"id"`
	Date            time.Time         `json:"date"`
	Type            domain.ReportType `json:"type"`
	Views           int64             `json:"views"`
	Signups         int64             `json:"signups"`
	ConversionRate  float64           `json:"conversionRate"`
	EngagementRate  float64           `json:"engagementRate"`
	Validated       bool              `json:"validated"`
	Sentiment       float64           `json:"sentiment"`
	CreatedAt       string            `json:"createdAt"`
	UpdatedAt       string            `json:"updatedAt"`
	Idea            ReportIdea        `json:"idea"`
	Recommendations []string          `json:"recommendations,omitempty"`
}

type ReportsOverview struct {
	TotalSignups       int64   `json:"totalSignups"`
	TotalViews         int64   `json:"totalViews"`
	AvgSentiment       float64 `json:"avgSentiment"`
	TotalSignupsChange float64 `json:"totalSignupsChange"`
	TotalViewsChange   float64 `json:"totalViewsChange"`
	AvgSentimentChange float64 `json:"avgSentimentChange"`
	SuccessRate        float64 `json:"successRate"`
}

type ReportsConversionData struct {
	Title          string    `json:"title"`
	ConversionRate float64   `json:"value"`
	ID             uuid.UUID `json:"id"`
}

// single report response
type ReportPerformanceOverview struct {
	Views   int64  `json:"views"`
	Signups int64  `json:"signups"`
	Date    string `json:"date"`
}

type ReportSignupsTimeline struct {
	DailySignups  []NameValueData `json:"dailySignups"`
	WeeklySignups []NameValueData `json:"weeklySignups"`
}

type ReportValidationThreshold struct {
	Signups        int64   `json:"signups"`
	ConversionRate float64 `json:"conversionRate"`
}

type NameValueData struct {
	Name  string `json:"name"`
	Total int64  `json:"value"`
}
