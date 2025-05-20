package domain

import (
	"time"

	"github.com/google/uuid"
)

// ReportType represents the type of validation report
type ReportType string

// Report types
const (
	ReportTypeWeekly    ReportType = "weekly"
	ReportTypeMonthly   ReportType = "monthly"
	ReportTypeMilestone ReportType = "milestone"
	ReportTypeFinal     ReportType = "final"
)

// Report represents a validation report for an idea
type Report struct {
	Base
	IdeaID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"ideaId"`
	Date           time.Time  `gorm:"not null" json:"date"`
	Type           ReportType `gorm:"type:varchar(20);not null;index" json:"type"`
	Views          int64      `gorm:"not null;default:0" json:"views"`
	Signups        int64      `gorm:"not null;default:0" json:"signups"`
	EngagementRate float64    `gorm:"not null;default:0" json:"engagementRate"`
	Validated      bool       `gorm:"not null;default:false;index" json:"validated"`
	Sentiment      float64    `gorm:"not null;default:0" json:"sentiment"`

	// Relationships
	Idea Idea `gorm:"foreignKey:IdeaID;references:ID" json:"idea,omitempty"`
}
