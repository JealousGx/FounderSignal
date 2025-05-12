package service

import (
	"context"
	"foundersignal/internal/domain"
	"foundersignal/internal/repository"

	"github.com/google/uuid"
)

type MVPService interface {
	GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error)
}

type mvpService struct {
	repo repository.MVPRepository
}

func NewMVPService(repo repository.MVPRepository) *mvpService {
	return &mvpService{
		repo: repo,
	}
}

func (s *mvpService) GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error) {
	mvp, err := s.repo.GetByIdea(ctx, ideaId)
	if err != nil {
		return nil, err
	}

	if mvp == nil {
		return nil, nil
	}

	mvp.HTMLContent = generateLandingPageContent(*mvp)

	return mvp, nil
}
