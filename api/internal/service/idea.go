package service

import (
	"context"
	"errors"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/repository"
	"foundersignal/pkg/validator"

	"github.com/google/uuid"
)

type IdeaService interface {
	Create(ctx context.Context, req *request.CreateIdea) (uuid.UUID, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Idea, error)
	GetAll(ctx context.Context, isDashboard bool) ([]*domain.Idea, error)
	UpdateMVP(ctx context.Context, mvpId, ideaId uuid.UUID, userId string, req *request.UpdateMVP) error
}

type ideaService struct {
	repo repository.IdeaRepository
}

func NewIdeasService(repo repository.IdeaRepository) *ideaService {
	return &ideaService{
		repo: repo,
	}
}

func (s *ideaService) Create(ctx context.Context, req *request.CreateIdea) (uuid.UUID, error) {
	if err := validator.Validate(req); err != nil {
		return uuid.Nil, err
	}

	idea := &domain.Idea{
		UserID:         req.UserID,
		Title:          req.Title,
		Description:    req.Description,
		TargetAudience: req.TargetAudience,
	}

	mvp := &domain.MVPSimulator{
		IdeaID:      idea.ID,
		Headline:    idea.Title,
		Subheadline: idea.Description,
		CTAButton:   req.CTAButton,
		HTMLContent: generateLandingPage(*req),
	}

	return s.repo.CreateWithMVP(ctx, idea, mvp)
}

func (s *ideaService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Idea, error) {
	idea, err := s.repo.GetWithMVP(ctx, id)
	if err != nil {
		return nil, err
	}

	return idea, nil
}

func (s *ideaService) GetAll(ctx context.Context, isDashboard bool) ([]*domain.Idea, error) {
	ideas, err := s.repo.GetAll(ctx, isDashboard)
	if err != nil {
		return nil, err
	}

	return ideas, nil
}

func (s *ideaService) UpdateMVP(ctx context.Context, mvpId, ideaId uuid.UUID, userId string, req *request.UpdateMVP) error {
	isCreator, err := s.repo.VerifyIdeaOwner(ctx, ideaId, userId)
	if err != nil {
		return err
	}

	if !isCreator {
		return errors.New("unauthorized: you don't have permission to update this MVP")
	}

	var mvp domain.MVPSimulator

	if req.Headline != "" {
		mvp.Headline = req.Headline
	}

	if req.Subheadline != "" {
		mvp.Subheadline = req.Subheadline
	}

	if req.CTAButton != "" {
		mvp.CTAButton = req.CTAButton
	}

	if req.CTAText != "" {
		mvp.CTAText = req.CTAText
	}

	return s.repo.UpdateMVP(ctx, mvpId, &mvp)
}

func generateLandingPage(req request.CreateIdea) string {
	// This is a simple HTML template for the MVP landing page.
	// Use AI to generate a more complex and engaging design.

	return fmt.Sprintf(`
		<div class="mvp">
			<h1>%s</h1>
			<p>%s</p>
			<button onclick="trackCta()">%s</button>
		</div>`,
		req.Title,
		req.Description,
		req.CTAButton,
	)
}
