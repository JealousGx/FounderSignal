package domain

import (
	"github.com/google/uuid"
)

// ReportType represents the type of validation report
type ReportType string

// Report types
const (
    ReportTypeWeekly    ReportType = "Weekly"
    ReportTypeMonthly   ReportType = "Monthly"
    ReportTypeMilestone ReportType = "Milestone"
    ReportTypeFinal     ReportType = "Final"
)

// Report represents a validation report for an idea
type Report struct {
    Base
    IdeaID         uuid.UUID  `gorm:"type:uuid;not null" json:"ideaId"`
    Type           ReportType `gorm:"type:varchar(20);not null" json:"type"`
    Views          int        `gorm:"not null;default:0" json:"views"`
    Signups        int        `gorm:"not null;default:0" json:"signups"`
    Validated      bool       `gorm:"not null;default:false" json:"validated"`
    Sentiment      float64    `gorm:"not null;default:0" json:"sentiment"`
    
    // Relationships
    Idea           Idea       `gorm:"foreignKey:IdeaID" json:"-"`
}