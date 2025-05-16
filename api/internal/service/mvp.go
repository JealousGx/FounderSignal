package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MVPService interface {
	GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error)
	Update(ctx context.Context, ideaId uuid.UUID, userId string, req request.UpdateMVP) error
}

type mvpService struct {
	repo     repository.MVPRepository
	ideaRepo repository.IdeaRepository
}

func NewMVPService(repo repository.MVPRepository, ideaRepo repository.IdeaRepository) *mvpService {
	return &mvpService{
		repo:     repo,
		ideaRepo: ideaRepo,
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

func (s *mvpService) Update(ctx context.Context, ideaId uuid.UUID, userId string, req request.UpdateMVP) error {
	idea, _, err := s.ideaRepo.GetByID(ctx, ideaId, nil)
	if err != nil {
		return err
	}

	if idea == nil {
		return gorm.ErrRecordNotFound
	}

	if idea.UserID != userId {
		return fmt.Errorf("user %s is not the owner of idea %s", userId, idea.ID)
	}

	mvp := &domain.MVPSimulator{
		IdeaID:      idea.ID,
		Headline:    req.Headline,
		Subheadline: req.Subheadline,
		CTAText:     req.CTAText,
		CTAButton:   req.CTAButton,
	}

	return s.repo.Update(ctx, mvp)
}
