package models

import (
	"github.com/google/uuid"
)

type Idea struct {
	Base
	UserID string `gorm:"not null" json:"userId"`
	Title string `gorm:"not null" json:"title"`
	Description string `gorm:"type:text;not null" json:"description"`
	Status        string    `gorm:"not null;default:'Draft'" json:"status"` // Active, Paused, Completed, Draft
    Stage         string    `gorm:"not null;default:'Ideation'" json:"stage"` // Validation, MVP, Ideation
    TargetSignups int       `gorm:"default:100" json:"targetSignups"`
    ImageURL      string    `json:"imageUrl"`
    IsPublic      bool      `gorm:"default:false" json:"isPublic"`

    // Virtual fields (not stored in DB but computed)
    Signups        int     `gorm:"-" json:"signups"`
    Views          int     `gorm:"-" json:"views"`
    EngagementRate float64 `gorm:"-" json:"engagementRate"`

    // Relationships
    MVPSimulator *MVPSimulator `gorm:"foreignKey:IdeaID" json:"mvpSimulator,omitempty"`
    Signals      []Signal      `gorm:"foreignKey:IdeaID" json:"-"`
    Feedback     []Feedback    `gorm:"foreignKey:IdeaID" json:"-"`

}

// MVPSimulator represents the mock landing page for an idea
type MVPSimulator struct {
    Base
    IdeaID      uuid.UUID      `gorm:"type:uuid;not null" json:"ideaId"`
    Headline    string         `json:"headline"`
    Subheadline string         `json:"subheadline"`
    CTAText     string         `json:"ctaText"`
    CTAButton   string         `json:"ctaButtonText"`
    HTMLContent string         `gorm:"type:text" json:"htmlContent"`
    CTALabels   []string       `gorm:"type:jsonb" json:"ctaLabels"`

	// Relationships
    Idea        Idea           `gorm:"foreignKey:IdeaID" json:"-"`
}

// Signal represents user interaction events with an MVP
type Signal struct {
    Base
    IdeaID    uuid.UUID          `gorm:"type:uuid;not null" json:"ideaId"`
    UserID    string             `json:"userId,omitempty"` // Can be null for anonymous users
    EventType string             `gorm:"not null" json:"eventType"` // click, scroll, pageview, etc.
    Metadata  map[string]interface{} `gorm:"type:jsonb" json:"metadata"`

	// Relationships
    Idea      Idea               `gorm:"foreignKey:IdeaID" json:"-"`
}
// Feedback represents user feedback on an idea
type Feedback struct {
    Base
    IdeaID      uuid.UUID  `gorm:"type:uuid;not null" json:"ideaId"`
    UserID      string     `json:"userId,omitempty"` // Can be null for anonymous feedback
    Comment     string     `gorm:"type:text" json:"comment"`
    ParentID    *uuid.UUID `gorm:"type:uuid;null" json:"parentId,omitempty"` // For nested replies
    Likes       int        `gorm:"default:0" json:"likes"`
    Dislikes    int        `gorm:"default:0" json:"dislikes"`
    
    // Relationships
    Idea        Idea       `gorm:"foreignKey:IdeaID" json:"-"`
    Parent      *Feedback  `gorm:"foreignKey:ParentID" json:"-"`
    Replies     []Feedback `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

// FeedbackReaction tracks individual user reactions (likes/dislikes) to feedback
type FeedbackReaction struct {
    Base
    FeedbackID  uuid.UUID `gorm:"type:uuid;not null" json:"feedbackId"`
    UserID      string    `gorm:"not null" json:"userId"`
    ReactionType string   `gorm:"not null" json:"reactionType"` // "like" or "dislike"
    
    // Relationship
    Feedback    Feedback  `gorm:"foreignKey:FeedbackID" json:"-"`
}
