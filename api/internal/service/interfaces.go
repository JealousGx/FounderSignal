package service

import (
	"context"
	"foundersignal/internal/domain"
)

type IdeaService interface {
	Create(ctx context.Context, idea *domain.Idea) error
	GetByID(ctx context.Context, id string) (*domain.Idea, error)
	GetAll(ctx context.Context) ([]*domain.Idea, error)
}
