package service

import (
	"context"
	"foundersignal/internal/domain"
	"foundersignal/internal/repository"
)

type ideaService struct {
	repo repository.IdeaRepository
}

func NewIdeasService(repo repository.IdeaRepository) *ideaService {
	return &ideaService{
		repo: repo,
	}
}

func (s *ideaService) Create(ctx context.Context, idea *domain.Idea) error {
	if err := validateIdea(idea); err != nil {
		return err
	}

	return s.repo.Create(ctx, idea)
}

func (s *ideaService) GetByID(ctx context.Context, id string) (*domain.Idea, error) {
	idea, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return idea, nil
}

func (s *ideaService) GetAll(ctx context.Context) ([]*domain.Idea, error) {
	ideas, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	return ideas, nil
}

func validateIdea(idea *domain.Idea) error {
	if idea.Title == "" {
		return domain.ErrInvalidIdeaTitle
	}

	if idea.Description == "" {
		return domain.ErrInvalidIdeaDescription
	}

	return nil
}
