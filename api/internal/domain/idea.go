package domain

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Idea struct {
	Base
	UserID         string `gorm:"not null;index;uniqueIndex:idx_user_idea_title" json:"userId"`
	Title          string `gorm:"not null;uniqueIndex:idx_user_idea_title" json:"title"`
	Slug           string `gorm:"not null;uniqueIndex;index" json:"slug"`
	Description    string `gorm:"type:text;not null" json:"description"`
	TargetAudience string `gorm:"not null" json:"targetAudience"`
	IsPrivate      *bool  `gorm:"default:false" json:"isPrivate"`
	Status         string `gorm:"not null;default:'active';index" json:"status"` // status defined in ./types.go file
	Stage          string `gorm:"not null;default:'ideation';index" json:"stage"`
	TargetSignups  int    `gorm:"default:100" json:"targetSignups"`
	ImageURL       string `json:"imageUrl"`
	Likes          int    `gorm:"default:0" json:"likes"`
	Dislikes       int    `gorm:"default:0" json:"dislikes"`

	// Search-specific fields for better performance
	SearchVector string `gorm:"type:tsvector;index:idx_search_vector,type:gin" json:"-"`

	Signups        int     `json:"signups"`
	Views          int     `json:"views"`
	EngagementRate float64 `json:"engagementRate"`
	LikedByUser    bool    `json:"likedByUser,omitempty"`
	DislikedByUser bool    `json:"dislikedByUser,omitempty"`

	// Relationships
	MVPs            []MVPSimulator   `gorm:"foreignKey:IdeaID" json:"mvps,omitempty"`
	Signals         []Signal         `gorm:"foreignKey:IdeaID" json:"signals,omitempty"`
	Feedback        []Feedback       `gorm:"foreignKey:IdeaID" json:"comments,omitempty"`
	AudienceMembers []AudienceMember `gorm:"foreignKey:IdeaID" json:"audience,omitempty"`
	Reactions       []IdeaReaction   `gorm:"foreignKey:IdeaID" json:"reactions,omitempty"`
	Reports         []Report         `gorm:"foreignKey:IdeaID" json:"reports,omitempty"`
}

func (i *Idea) AfterFind(tx *gorm.DB) (err error) {
	var likesCount int
	var dislikesCount int

	var viewsCount int

	if len(i.Reactions) > 0 {
		for _, reaction := range i.Reactions {
			if reaction.ReactionType == "like" {
				likesCount++
			} else if reaction.ReactionType == "dislike" {
				dislikesCount++
			}
		}

		i.Likes = likesCount
		i.Dislikes = dislikesCount
	}

	if len(i.Signals) > 0 {
		for _, signal := range i.Signals {
			if signal.EventType == string(EventTypePageView) {
				viewsCount++
			}
		}

		i.Views = viewsCount
	}

	if len(i.AudienceMembers) > 0 {
		i.Signups = len(i.AudienceMembers)
	}

	return nil
}

// MVPSimulator represents the mock landing page for an idea
type MVPSimulator struct {
	Base
	IdeaID      uuid.UUID `gorm:"type:uuid;not null;index" json:"ideaId"`
	Name        string    `gorm:"not null" json:"name"`
	IsActive    bool      `gorm:"default:false;not null" json:"isActive"`
	HTMLContent string    `gorm:"type:text" json:"htmlContent"`

	Views   int `gorm:"-" json:"views"`
	Signups int `gorm:"-" json:"signups"`

	// Relationships
	Idea            Idea             `gorm:"foreignKey:IdeaID" json:"-"`
	Signals         []Signal         `gorm:"foreignKey:MVPSimulatorID" json:"-"`
	AudienceMembers []AudienceMember `gorm:"foreignKey:MVPSimulatorID" json:"-"`
}

func (m *MVPSimulator) AfterFind(tx *gorm.DB) (err error) {
	var viewsCount int
	for _, signal := range m.Signals {
		if signal.EventType == string(EventTypePageView) {
			viewsCount++
		}
	}
	m.Views = viewsCount
	m.Signups = len(m.AudienceMembers)
	return nil
}

// Signal represents user interaction events with an MVP
type Signal struct {
	Base
	IdeaID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"ideaId"`
	MVPSimulatorID uuid.UUID      `gorm:"type:uuid;not null;index" json:"mvpSimulatorId"`
	UserID         string         `json:"userId,omitempty"`                // Can be null for anonymous users
	EventType      string         `gorm:"not null;index" json:"eventType"` // click, scroll, pageview, etc.
	IPAddress      string         `json:"-"`
	UserAgent      string         `json:"-"`
	Metadata       datatypes.JSON `gorm:"type:jsonb" json:"metadata"`

	// Relationships
	Idea         Idea         `gorm:"foreignKey:IdeaID" json:"-"`
	MVPSimulator MVPSimulator `gorm:"foreignKey:MVPSimulatorID" json:"-"`
}

// Feedback represents user feedback on an idea
type Feedback struct {
	Base
	IdeaID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"ideaId"`
	UserID         string     `gorm:"not null;index" json:"userId"`
	Comment        string     `gorm:"type:text" json:"comment"`
	SentimentScore float64    `gorm:"default:0.5" json:"sentimentScore"`              // Normalized score (e.g., 0.0 to 1.0)
	ParentID       *uuid.UUID `gorm:"type:uuid;null;index" json:"parentId,omitempty"` // For nested replies
	Likes          int        `gorm:"default:0" json:"likes"`
	Dislikes       int        `gorm:"default:0" json:"dislikes"`

	// Relationships
	Idea      Idea               `gorm:"foreignKey:IdeaID" json:"-"`
	Parent    *Feedback          `gorm:"foreignKey:ParentID" json:"-"`
	Replies   []Feedback         `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
	Reactions []FeedbackReaction `gorm:"foreignKey:FeedbackID"`
}

func (f *Feedback) AfterFind(tx *gorm.DB) (err error) {
	// This hook calculates Likes and Dislikes based on the f.Reactions slice.
	// It assumes that f.Reactions are preloaded when Feedback is fetched.
	// If f.Reactions is not preloaded, Likes and Dislikes will reflect
	// the values from the database columns (or 0 if calculated from an empty slice).

	var likesCount int
	var dislikesCount int

	for _, reaction := range f.Reactions {
		if reaction.ReactionType == "like" {
			likesCount++
		} else if reaction.ReactionType == "dislike" {
			dislikesCount++
		}
	}
	f.Likes = likesCount
	f.Dislikes = dislikesCount
	return nil
}

// FeedbackReaction tracks individual user reactions (likes/dislikes) to feedback
type FeedbackReaction struct {
	Base
	FeedbackID   uuid.UUID `gorm:"type:uuid;not null;index:idx_feedback_user_reaction,unique" json:"feedbackId"`
	UserID       string    `gorm:"index:idx_feedback_user_reaction,unique" json:"userId"`
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
