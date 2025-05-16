package response

import (
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
)

type DashboardResponse struct {
	Metrics       Metrics         `json:"metrics"`
	RecentIdeas   []domain.Idea   `json:"recentIdeas"`
	AnalyticsData []AnalyticsData `json:"analyticsData"`
}

type DashboardIdeaResponse struct {
	Idea          domain.Idea     `json:"idea"`
	AnalyticsData []AnalyticsData `json:"analyticsData"`
}

// Metrics holds the overview metrics.
type Metrics struct {
	TotalSignups          int     `json:"totalSignups"`
	SignupsChange         float64 `json:"signupsChange"`
	AvgConversion         float64 `json:"avgConversion"`
	ConversionChange      float64 `json:"conversionChange"`
	IdeasValidated        int     `json:"ideasValidated"`
	IdeasChange           float64 `json:"ideasChanged"`
	AverageSignupsPerIdea float64 `json:"averageSignupsPerIdea"`
}

// AnalyticsData contains time-series data for idea analytics
type AnalyticsData struct {
	IdeaID     uuid.UUID   `json:"ideaId"`
	IdeaTitle  string      `json:"ideaTitle"`
	DataPoints []DataPoint `json:"dataPoints"`
	Totals     Totals      `json:"totals"`
}

// DataPoint represents a single point in the analytics time series
type DataPoint struct {
	Date           string  `json:"date"`
	Views          int     `json:"views"`
	Signups        int     `json:"signups"`
	ConversionRate float64 `json:"conversionRate"`
}

// Totals represents the summary metrics for analytics
type Totals struct {
	Views                 int     `json:"views"`
	Signups               int     `json:"signups"`
	AverageConversionRate float64 `json:"averageConversionRate"`
}

// ActivityItem represents a single activity in the activity feed
type ActivityItem struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"` // e.g., "signup", "view", "feedback"
	IdeaID    string    `json:"ideaId"`
	IdeaTitle string    `json:"ideaTitle"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type IdeaWithActivity struct {
	domain.Idea
	LatestSignupDate *time.Time `gorm:"column:latest_signup"`
	LatestViewDate   *time.Time `gorm:"column:latest_view"`
}
