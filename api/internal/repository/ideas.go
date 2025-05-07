package repository

import (
	"context"
	"foundersignal/internal/domain"

	"gorm.io/gorm"
)

type IdeasRepository struct {
	db *gorm.DB
}

func NewIdeasRepo(db *gorm.DB) *IdeasRepository {
	return &IdeasRepository{db: db}
}

func (r *IdeasRepository) Create(ctx context.Context, idea *domain.Idea) error {
	return r.db.WithContext(ctx).Create(idea).Error
}

func (r *IdeasRepository) GetByID(ctx context.Context, id string) (*domain.Idea, error) {
	var idea domain.Idea
	err := r.db.WithContext(ctx).First(&idea, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &idea, nil
}

func (r *IdeasRepository) GetAll(ctx context.Context) ([]*domain.Idea, error) {
	var ideas []*domain.Idea
	err := r.db.WithContext(ctx).Find(&ideas).Error
	if err != nil {
		return nil, err
	}
	return ideas, nil
}
