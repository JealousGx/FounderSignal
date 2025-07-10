package domain

import "github.com/google/uuid"

type ActivityType string

const (
	ActivityTypeContentReported ActivityType = "content_reported"
)

// Activity represents a generic activity or notification for a user.
type Activity struct {
	Base
	UserID       string       `gorm:"type:varchar(255);index"`
	IdeaID       uuid.UUID    `gorm:"type:uuid;index"`
	Message      string       `gorm:"type:text"`
	Type         ActivityType `gorm:"type:varchar(50);index"`
	IsRead       bool         `gorm:"default:false"`
	TriggeredBy  *string      `gorm:"type:varchar(255)"` // Optional: ID of the user who triggered the activity
	ReferenceID  string       `gorm:"type:varchar(255)"` // Optional: ID of the related entity (e.g., report, comment)
	ReferenceURL string       `gorm:"type:text"`
}
