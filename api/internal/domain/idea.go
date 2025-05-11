package domain

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

var (
	ErrInvalidIdeaTitle       = errors.New("invalid idea title")
	ErrInvalidIdeaDescription = errors.New("invalid idea description")
)

type Idea struct {
	Base
	UserID         string `gorm:"not null;index" json:"userId"`
	Title          string `gorm:"not null" json:"title"`
	Description    string `gorm:"type:text;not null" json:"description"`
	TargetAudience string `gorm:"not null" json:"targetAudience"`
	Status         string `gorm:"not null;default:'active';index" json:"status"`  // Active, Paused, Completed, Draft
	Stage          string `gorm:"not null;default:'Ideation';index" json:"stage"` // Validation, MVP, Ideation
	TargetSignups  int    `gorm:"default:100" json:"targetSignups"`
	ImageURL       string `json:"imageUrl"`
	Likes          int    `gorm:"default:0" json:"likes"`
	Dislikes       int    `gorm:"default:0" json:"dislikes"`

	// Virtual fields (not stored in DB but computed)
	Signups        int     `json:"signups"`
	Views          int     `json:"views"`
	EngagementRate float64 `json:"engagementRate"`
	LikedByUser    bool    `json:"likedByUser,omitempty"`
	DislikedByUser bool    `json:"dislikedByUser,omitempty"`

	// Relationships
	MVPSimulator    *MVPSimulator    `gorm:"foreignKey:IdeaID" json:"mvpSimulator,omitempty"`
	Signals         []Signal         `gorm:"foreignKey:IdeaID" json:"-"`
	Feedback        []Feedback       `gorm:"foreignKey:IdeaID" json:"-"`
	AudienceMembers []AudienceMember `gorm:"foreignKey:IdeaID" json:"-"`
	Reactions       []IdeaReaction   `gorm:"foreignKey:IdeaID" json:"-"`
}

// MVPSimulator represents the mock landing page for an idea
type MVPSimulator struct {
	IdeaID      uuid.UUID `gorm:"type:uuid;not null;index" json:"ideaId"`
	Headline    string    `json:"headline"`
	Subheadline string    `json:"subheadline"`
	CTAText     string    `json:"ctaText"`
	CTAButton   string    `json:"ctaButtonText"`
	HTMLContent string    `gorm:"type:text" json:"htmlContent"`

	// Relationships
	Idea Idea `gorm:"foreignKey:IdeaID" json:"-"`
}

// Signal represents user interaction events with an MVP
type Signal struct {
	Base
	IdeaID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"ideaId"`
	UserID    string         `json:"userId,omitempty"`                // Can be null for anonymous users
	EventType string         `gorm:"not null;index" json:"eventType"` // click, scroll, pageview, etc.
	IPAddress string         `json:"-"`
	UserAgent string         `json:"-"`
	Metadata  datatypes.JSON `gorm:"type:jsonb" json:"metadata"`

	// Relationships
	Idea Idea `gorm:"foreignKey:IdeaID" json:"-"`
}

// Feedback represents user feedback on an idea
type Feedback struct {
	Base
	IdeaID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"ideaId"`
	UserID   string     `gorm:"not null;index" json:"userId,omitempty"` // Can be null for anonymous feedback
	Comment  string     `gorm:"type:text" json:"comment"`
	ParentID *uuid.UUID `gorm:"type:uuid;null;index" json:"parentId,omitempty"` // For nested replies
	Likes    int        `gorm:"default:0" json:"likes"`
	Dislikes int        `gorm:"default:0" json:"dislikes"`

	// Relationships
	Idea      Idea               `gorm:"foreignKey:IdeaID" json:"-"`
	Parent    *Feedback          `gorm:"foreignKey:ParentID" json:"-"`
	Replies   []Feedback         `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
	Reactions []FeedbackReaction `gorm:"foreignKey:FeedbackID" json:"-"`
}

// FeedbackReaction tracks individual user reactions (likes/dislikes) to feedback
type FeedbackReaction struct {
	Base
	FeedbackID   uuid.UUID `gorm:"type:uuid;not null" json:"feedbackId"`
	UserID       string    `gorm:"index" json:"userId"`
	ReactionType string    `gorm:"not null" json:"reactionType"` // "like" or "dislike"

	// Relationship
	Feedback Feedback `gorm:"foreignKey:FeedbackID" json:"-"`
}

type IdeaReaction struct {
	Base
	IdeaID       uuid.UUID `gorm:"type:uuid;not null;index:idx_idea_reaction_user_idea,unique" json:"ideaId"`
	UserID       string    `gorm:"index:idx_idea_reaction_user_idea,unique" json:"userId,omitempty"`
	ReactionType string    `gorm:"not null" json:"reactionType"` // e.g., "like", "dislike"

	// Relationship
	Idea Idea `gorm:"foreignKey:IdeaID" json:"-"`
}
