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
	Create(ctx context.Context, userId string, ideaId uuid.UUID, req request.CreateMVP) (uuid.UUID, error)
	GetAllByIdea(ctx context.Context, userId string, ideaId uuid.UUID) ([]domain.MVPSimulator, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) (*domain.MVPSimulator, error)
	Update(ctx context.Context, ideaId uuid.UUID, userId string, mvpId uuid.UUID, req request.UpdateMVP) error
	GetByID(ctx context.Context, userId string, ideaId, id uuid.UUID) (*domain.MVPSimulator, error)
	Delete(ctx context.Context, userId string, ideaId, mvpId uuid.UUID) error
	SetActive(ctx context.Context, userId string, ideaId, mvpId uuid.UUID) error
	GenerateLandingPage(ctx context.Context, mvpId, ideaId uuid.UUID, userId, prompt string) (string, error)
}

type mvpService struct {
	repo      repository.MVPRepository
	ideaRepo  repository.IdeaRepository
	userRepo  repository.UserRepository
	aiService AIService
}

func NewMVPService(repo repository.MVPRepository, ideaRepo repository.IdeaRepository, userRepo repository.UserRepository, aiService AIService) *mvpService {
	return &mvpService{
		repo:      repo,
		ideaRepo:  ideaRepo,
		userRepo:  userRepo,
		aiService: aiService,
	}
}

func (s *mvpService) Create(ctx context.Context, userId string, ideaId uuid.UUID, req request.CreateMVP) (uuid.UUID, error) {
	if _, err := s.checkOwner(ctx, userId, ideaId); err != nil {
		return uuid.Nil, err
	}

	user, err := s.userRepo.FindByID(ctx, userId)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return uuid.Nil, gorm.ErrRecordNotFound
	}

	mvpLimit := domain.GetMVPLimitForPlan(user.Plan)
	currentMVPCount, err := s.repo.GetCountByIdea(ctx, ideaId)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to get current MVP count: %w", err)
	}

	if currentMVPCount >= int64(mvpLimit) {
		return uuid.Nil, fmt.Errorf("you have reached the MVP limit of %d for the %s plan", mvpLimit, user.Plan)
	}

	mvp := &domain.MVPSimulator{
		IdeaID:   ideaId,
		Name:     req.Name,
		HTMLURL:  req.HTMLURL,
		IsActive: false, // Default to false, can be set active later
	}

	id, err := s.repo.Create(ctx, mvp)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create MVP: %w", err)
	}

	if req.IsActive {
		// internally sets the MVP as active and others as inactive
		if err := s.repo.SetActive(ctx, ideaId, id); err != nil {
			return uuid.Nil, fmt.Errorf("mvp created but failed to set as active: %w", err)
		}
	}

	return id, nil
}

// GetAllByIdea retrieves all MVPs for a specific idea, ensuring the user is the owner.
func (s *mvpService) GetAllByIdea(ctx context.Context, userId string, ideaId uuid.UUID) ([]domain.MVPSimulator, error) {
	if _, err := s.checkOwner(ctx, userId, ideaId); err != nil {
		return nil, err
	}

	return s.repo.GetAllByIdea(ctx, ideaId)
}

// GetByIdea retrieves the MVP for a specific idea, ensuring the user is the owner or the MVP is active.
func (s *mvpService) GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) (*domain.MVPSimulator, error) {
	idea, _, err := s.ideaRepo.GetByID(ctx, ideaId, nil, nil)
	if err != nil || idea == nil {
		return nil, gorm.ErrRecordNotFound
	}

	// if idea.Status is not active and the user is not the owner, return
	isOwner := userId != nil && *userId == idea.UserID
	if idea.Status != string(domain.IdeaStatusActive) && !isOwner {
		return nil, gorm.ErrRecordNotFound
	}

	mvp, err := s.repo.GetByIdea(ctx, ideaId)
	if err != nil {
		return nil, err
	}

	if mvp == nil {
		return nil, nil
	}

	mvp.Idea = *idea

	return mvp, nil
}

func (s *mvpService) Update(ctx context.Context, ideaId uuid.UUID, userId string, mvpId uuid.UUID, req request.UpdateMVP) error {
	if _, err := s.checkOwner(ctx, userId, ideaId); err != nil {
		return err
	}

	mvp, err := s.repo.GetByID(ctx, mvpId)
	if err != nil || mvp == nil || mvp.IdeaID != ideaId {
		return gorm.ErrRecordNotFound
	}

	if req.Name != nil {
		mvp.Name = *req.Name
	}
	if *req.HTMLURL != "" {
		mvp.HTMLURL = *req.HTMLURL
	}

	return s.repo.Update(ctx, mvp)
}

func (s *mvpService) SetActive(ctx context.Context, userId string, ideaId, mvpId uuid.UUID) error {
	if _, err := s.checkOwner(ctx, userId, ideaId); err != nil {
		return err
	}

	mvp, err := s.repo.GetByID(ctx, mvpId)
	if err != nil || mvp == nil || mvp.IdeaID != ideaId {
		return gorm.ErrRecordNotFound
	}

	return s.repo.SetActive(ctx, ideaId, mvpId)
}

// GetByID retrieves an MVP by its ID, ensuring the user is the owner of the idea.
func (s *mvpService) GetByID(ctx context.Context, userId string, ideaId, id uuid.UUID) (*domain.MVPSimulator, error) {
	idea, err := s.checkOwner(ctx, userId, ideaId)
	if err != nil {
		return nil, err
	}

	mvp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get MVP: %w", err)
	}

	if mvp == nil || mvp.IdeaID != idea.ID {
		return nil, gorm.ErrRecordNotFound
	}

	return mvp, nil
}

// Delete removes an MVP by its ID, ensuring the user is the owner of the idea.
func (s *mvpService) Delete(ctx context.Context, userId string, ideaId, mvpId uuid.UUID) error {
	idea, err := s.checkOwner(ctx, userId, ideaId)
	if err != nil {
		return err
	}

	mvp, err := s.repo.GetByID(ctx, mvpId)
	if err != nil || mvp == nil || mvp.IdeaID != idea.ID {
		return gorm.ErrRecordNotFound
	}

	return s.repo.Delete(ctx, mvpId)
}

// GenerateLandingPage generates a landing page for an MVP using AI, ensuring the user has not exceeded their AI generation limit.
func (s *mvpService) GenerateLandingPage(ctx context.Context, mvpId, ideaId uuid.UUID, userId, prompt string) (string, error) {
	user, err := s.userRepo.FindByID(ctx, userId)
	if err != nil {
		return "", fmt.Errorf("failed to find user: %w", err)
	}

	mvp, err := s.repo.GetByID(ctx, mvpId)
	if err != nil {
		fmt.Printf("WARNING: failed to get MVP by ID %s: %v", mvpId, err)
	}

	if mvp == nil && ideaId != uuid.Nil {
		mvp, err = s.repo.GetByIdea(ctx, ideaId)
		if err != nil {
			return "", fmt.Errorf("failed to get MVP by idea ID: %w", err)
		}
	}

	aiGenLimit := domain.GetAIGenLimitForPlan(user.Plan)
	if mvp.AIGenerations >= aiGenLimit {
		return "", fmt.Errorf("you have reached the AI generation limit of %d for the %s plan", aiGenLimit, user.Plan)
	}

	htmlContent, err := s.aiService.Generate(ctx, prompt)
	if err != nil {
		return "", fmt.Errorf("failed to generate AI content: %w", err)
	}

	mvp.AIGenerations++
	if err := s.repo.Update(ctx, mvp); err != nil {
		fmt.Printf("WARNING: failed to update AI generation count for MVP %s: %v", mvp.ID, err)
	}

	return htmlContent, nil
}

func (s *mvpService) checkOwner(ctx context.Context, userId string, ideaId uuid.UUID) (*domain.Idea, error) {
	idea, _, err := s.ideaRepo.GetByID(ctx, ideaId, nil, nil)

	if err != nil {
		return nil, fmt.Errorf("failed to get idea: %w", err)
	}

	if idea == nil {
		return nil, gorm.ErrRecordNotFound
	}

	if idea.UserID != userId {
		return nil, fmt.Errorf("user is not the owner of the idea")
	}

	return idea, nil
}
