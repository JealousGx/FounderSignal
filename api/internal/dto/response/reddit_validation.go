package response

import (
	"time"

	"github.com/google/uuid"
)

type RedditValidationResponse struct {
	ID               uuid.UUID  `json:"id"`
	IdeaID           uuid.UUID  `json:"ideaId"`
	IdeaTitle        string     `json:"ideaTitle"`
	Status           string     `json:"status"`
	ValidationScore  float64    `json:"validationScore"`
	ExecutiveSummary string     `json:"executiveSummary"`
	ProcessedAt      *time.Time `json:"processedAt"`
	Error            string     `json:"error,omitempty"`

	// JSON fields
	MarketAssessment     interface{} `json:"marketAssessment"`
	InsightDensity       interface{} `json:"insightDensity"`
	SubredditAnalysis    interface{} `json:"subredditAnalysis"`
	KeyPatterns          interface{} `json:"keyPatterns"`
	VoiceOfCustomer      interface{} `json:"voiceOfCustomer"`
	CompetitiveLandscape interface{} `json:"competitiveLandscape"`
	EmergingTrends       interface{} `json:"emergingTrends"`
	StartupOpportunities interface{} `json:"startupOpportunities"`
	TopRedditThreads     interface{} `json:"topRedditThreads"`
}

type RedditValidationListResponse struct {
	Validations []RedditValidationResponse `json:"validations"`
	Total       int64                      `json:"total"`
}
