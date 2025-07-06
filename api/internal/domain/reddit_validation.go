package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// ValidationStatus constants
const (
	ValidationStatusProcessing = "processing"
	ValidationStatusCompleted  = "completed"
	ValidationStatusFailed     = "failed"
)

// RedditValidation represents the main validation analysis
type RedditValidation struct {
	Base
	IdeaID               uuid.UUID      `gorm:"type:uuid;not null;index" json:"ideaId"`
	IdeaTitle            string         `gorm:"type:text;omitempty" json:"ideaTitle"`
	UserID               string         `gorm:"not null;index" json:"userId"`
	Status               string         `gorm:"not null;default:'processing'" json:"status"` // processing, completed, failed
	ValidationScore      float64        `json:"validationScore"`                             // 0-100
	MarketAssessment     datatypes.JSON `gorm:"type:jsonb" json:"marketAssessment"`
	ExecutiveSummary     string         `gorm:"type:text" json:"executiveSummary"`
	InsightDensity       datatypes.JSON `gorm:"type:jsonb" json:"insightDensity"`
	SubredditAnalysis    datatypes.JSON `gorm:"type:jsonb" json:"subredditAnalysis"`
	KeyPatterns          datatypes.JSON `gorm:"type:jsonb" json:"keyPatterns"`
	VoiceOfCustomer      datatypes.JSON `gorm:"type:jsonb" json:"voiceOfCustomer"`
	CompetitiveLandscape datatypes.JSON `gorm:"type:jsonb" json:"competitiveLandscape"`
	EmergingTrends       datatypes.JSON `gorm:"type:jsonb" json:"emergingTrends"`
	StartupOpportunities datatypes.JSON `gorm:"type:jsonb" json:"startupOpportunities"`
	TopRedditThreads     datatypes.JSON `gorm:"type:jsonb" json:"topRedditThreads"`
	ProcessedAt          *time.Time     `json:"processedAt"`
	Error                string         `gorm:"type:text" json:"error,omitempty"`

	// Relationships
	Idea Idea `gorm:"foreignKey:IdeaID" json:"-"`
}

// RedditThread represents individual Reddit posts/comments
type RedditThread struct {
	Base
	ValidationID uuid.UUID `gorm:"type:uuid;not null;index" json:"validationId"`
	ThreadID     string    `gorm:"not null;index" json:"threadId"`
	Subreddit    string    `gorm:"not null;index" json:"subreddit"`
	Title        string    `gorm:"type:text" json:"title"`
	Content      string    `gorm:"type:text" json:"content"`
	Author       string    `json:"author"`
	Score        int       `json:"score"`
	Comments     int       `json:"comments"`
	CreatedAt    time.Time `json:"createdAt"`
	Sentiment    float64   `json:"sentiment"` // -1 to 1
	Relevance    float64   `json:"relevance"` // 0 to 1

	// Relationships
	Validation RedditValidation `gorm:"foreignKey:ValidationID" json:"-"`
}
