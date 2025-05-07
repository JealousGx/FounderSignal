package repository

import (
	"context"
	"foundersignal/internal/domain"
)

type IdeaRepository interface {
	Create(ctx context.Context, idea *domain.Idea) error
	GetAll(ctx context.Context) ([]*domain.Idea, error)
	GetByID(ctx context.Context, id string) (*domain.Idea, error)
}
