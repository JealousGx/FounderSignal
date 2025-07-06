package repository

import (
	"context"
	"foundersignal/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RedditValidationRepository interface {
	Create(ctx context.Context, validation *domain.RedditValidation) (uuid.UUID, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.RedditValidation, error)
	GetByIdeaID(ctx context.Context, ideaID uuid.UUID) (*domain.RedditValidation, error)
	Update(ctx context.Context, validation *domain.RedditValidation) error
	GetForUser(ctx context.Context, userID string, queryParams domain.QueryParams) ([]*domain.RedditValidation, int64, error)
}

type redditValidationRepository struct {
	db *gorm.DB
}

func NewRedditValidationRepository(db *gorm.DB) RedditValidationRepository {
	return &redditValidationRepository{db: db}
}

func (r *redditValidationRepository) Create(ctx context.Context, validation *domain.RedditValidation) (uuid.UUID, error) {
	if err := r.db.WithContext(ctx).Create(validation).Error; err != nil {
		return uuid.Nil, err
	}
	return validation.ID, nil
}

func (r *redditValidationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.RedditValidation, error) {
	var validation domain.RedditValidation
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&validation).Error
	if err != nil {
		return nil, err
	}
	return &validation, nil
}

func (r *redditValidationRepository) GetByIdeaID(ctx context.Context, ideaID uuid.UUID) (*domain.RedditValidation, error) {
	var validation domain.RedditValidation
	err := r.db.WithContext(ctx).Where("idea_id = ?", ideaID).First(&validation).Error
	if err != nil {
		return nil, err
	}
	return &validation, nil
}

func (r *redditValidationRepository) Update(ctx context.Context, validation *domain.RedditValidation) error {
	return r.db.WithContext(ctx).Save(validation).Error
}

func (r *redditValidationRepository) GetForUser(ctx context.Context, userID string, queryParams domain.QueryParams) ([]*domain.RedditValidation, int64, error) {
	var validations []*domain.RedditValidation
	var total int64

	query := r.db.WithContext(ctx).Where("user_id = ?", userID)

	// Count total
	if err := query.Model(&domain.RedditValidation{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	if queryParams.Limit > 0 {
		query = query.Limit(queryParams.Limit)
	}
	if queryParams.Offset > 0 {
		query = query.Offset(queryParams.Offset)
	}

	// Apply sorting
	if queryParams.SortBy != "" {
		order := "DESC"
		if queryParams.Order == "asc" {
			order = "ASC"
		}
		query = query.Order(queryParams.SortBy + " " + order)
	} else {
		query = query.Order("created_at DESC")
	}

	if err := query.Find(&validations).Error; err != nil {
		return nil, 0, err
	}

	return validations, total, nil
}
