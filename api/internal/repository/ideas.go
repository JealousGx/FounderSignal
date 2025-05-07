package repository

import (
	"context"
	"foundersignal/internal/domain"

	"gorm.io/gorm"
)

type ideaRepository struct {
	db *gorm.DB
}

func NewIdeasRepo(db *gorm.DB) *ideaRepository {
	return &ideaRepository{db: db}
}

func (r *ideaRepository) Create(ctx context.Context, idea *domain.Idea) error {
	return r.db.WithContext(ctx).Create(idea).Error
}

func (r *ideaRepository) GetByID(ctx context.Context, id string) (*domain.Idea, error) {
	var idea domain.Idea
	err := r.db.WithContext(ctx).First(&idea, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &idea, nil
}

func (r *ideaRepository) GetAll(ctx context.Context) ([]*domain.Idea, error) {
	var ideas []*domain.Idea
	err := r.db.WithContext(ctx).Find(&ideas).Error
	if err != nil {
		return nil, err
	}
	return ideas, nil
}
