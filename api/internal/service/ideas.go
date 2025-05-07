package service

import (
	"context"
	"foundersignal/internal/domain"
	"foundersignal/internal/repository"
)

type IdeasService struct {
	repo repository.IdeaRepository
}

func NewIdeasService(repo repository.IdeaRepository) *IdeasService {
	return &IdeasService{
		repo: repo,
	}
}

func (s *IdeasService) Create(ctx context.Context, idea *domain.Idea) error {
	if err := validateIdea(idea); err != nil {
		return err
	}

	return s.repo.Create(ctx, idea)
}

func (s *IdeasService) GetByID(ctx context.Context, id string) (*domain.Idea, error) {
	idea, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return idea, nil
}

func (s *IdeasService) GetAll(ctx context.Context) ([]*domain.Idea, error) {
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
