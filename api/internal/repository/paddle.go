package repository

import (
	"context"
	"foundersignal/internal/domain"
	"time"

	"gorm.io/gorm"
)

type PaddleRepository interface {
	Exists(ctx context.Context, eventID string) (bool, error)
	Create(ctx context.Context, eventID string, eventType string) error
}

type paddleRepository struct {
	db *gorm.DB
}

func NewPaddleRepository(db *gorm.DB) PaddleRepository {
	return &paddleRepository{db: db}
}

func (r *paddleRepository) Exists(ctx context.Context, eventID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.PaddleProcessedEvent{}).Where("id = ?", eventID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *paddleRepository) Create(ctx context.Context, eventID string, eventType string) error {
	event := domain.PaddleProcessedEvent{
		ID:          eventID,
		Type:        eventType,
		ProcessedAt: time.Now(),
	}
	return r.db.WithContext(ctx).Create(&event).Error
}
