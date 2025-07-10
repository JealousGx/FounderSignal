package repository

import (
	"context"
	"foundersignal/internal/domain"

	"gorm.io/gorm"
)

type ActivityRepository interface {
	Create(ctx context.Context, activity *domain.Activity) error
	GetForUser(ctx context.Context, userID string, limit int) ([]domain.Activity, error)
}

type activityRepository struct {
	db *gorm.DB
}

func NewActivityRepository(db *gorm.DB) ActivityRepository {
	return &activityRepository{db: db}
}

func (r *activityRepository) Create(ctx context.Context, activity *domain.Activity) error {
	return r.db.WithContext(ctx).Create(activity).Error
}

func (r *activityRepository) GetForUser(ctx context.Context, userID string, limit int) ([]domain.Activity, error) {
	var activities []domain.Activity
	query := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&activities).Error
	return activities, err
}
