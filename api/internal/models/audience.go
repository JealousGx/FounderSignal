package models

import (
	"time"

	"github.com/google/uuid"
)

// AudienceMember represents a subscriber who has signed up for an idea
type AudienceMember struct {
    UserID      string    `gorm:"not null" json:"id"`
    SignupTime time.Time `gorm:"not null;default:now()" json:"signupTime"`
    IdeaID     uuid.UUID `gorm:"type:uuid;not null" json:"ideaId"`
    Engaged    bool      `gorm:"default:false" json:"engaged"`
    Converted  bool      `gorm:"default:false" json:"converted"`
    LastActive *time.Time `json:"lastActive,omitempty"`
    Visits     int       `gorm:"default:0" json:"visits"`
    
    // Relationships
    Idea       Idea      `gorm:"foreignKey:IdeaID" json:"idea,omitempty"`
}