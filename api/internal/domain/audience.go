package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AudienceMember represents a subscriber who has signed up for an idea
type AudienceMember struct {
	UserID         string     `gorm:"primary_key;not null" json:"userId"`
	UserEmail      string     `gorm:"type:varchar(255)" json:"userEmail"`
	SignupTime     time.Time  `gorm:"not null;default:now()" json:"signupTime"`
	MVPSimulatorID uuid.UUID  `gorm:"primary_key;type:uuid;not null" json:"mvpSimulatorId"`
	IdeaID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"ideaId"`
	Engaged        bool       `gorm:"default:false" json:"engaged"`
	Converted      bool       `gorm:"default:false" json:"converted"`
	LastActive     *time.Time `json:"lastActive,omitempty"`
	Visits         int        `gorm:"default:0" json:"visits"`

	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Idea         Idea         `gorm:"foreignKey:IdeaID" json:"idea,omitempty"`
	MVPSimulator MVPSimulator `gorm:"foreignKey:MVPSimulatorID" json:"-"`
}
