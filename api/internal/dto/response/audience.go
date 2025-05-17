package response

import "github.com/google/uuid"

type AudienceResponse struct {
	Audiences []*Audience       `json:"audiences"`
	Stats     *AudienceStats    `json:"stats"`
	Total     int64             `json:"total"`
	Metrics   []AudienceMetrics `json:"metrics"`
}

type Audience struct {
	UserID     string    `json:"userId"`
	IdeaID     uuid.UUID `json:"ideaId"`
	IdeaTitle  string    `json:"ideaTitle"`
	SignupTime string    `json:"signupTime"`
}

type AudienceStats struct {
	TotalSubscribers      int64   `json:"totalSubscribers"`
	NewSubscribers        int64   `json:"newSubscribers"`
	NewSubscribersChange  float64 `json:"newSubscribersChange"`
	AverageConversionRate float64 `json:"averageConversionRate"`
	ConversionRateChange  float64 `json:"conversionRateChange"`
	ActiveIdeas           int64   `json:"activeIdeas"`
}

type AudienceMetrics struct {
	IdeaTitle string `json:"name"`
	Count     int64  `json:"value"`
}
