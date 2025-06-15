package domain

import (
	"time"
)

// PaddleProcessedEvent stores the ID of a webhook event that has already been processed.
type PaddleProcessedEvent struct {
	ID          string    `gorm:"type:varchar(255);primary_key"` // This will be the Paddle event_id
	Type        string    `gorm:"type:varchar(150);not null"`    // Event type, e.g., "subscription.created"
	ProcessedAt time.Time `gorm:"not null;default:now()"`
}
