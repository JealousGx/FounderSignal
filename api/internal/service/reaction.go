package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/repository"
	"foundersignal/pkg/validator"

	"github.com/google/uuid"
)

type ReactionService interface {
	FeedbackReaction(ctx context.Context, fbId uuid.UUID, userId string, req request.Reaction) error
	IdeaReaction(ctx context.Context, ideaId uuid.UUID, userId string, req request.Reaction) error
}

type reactionService struct {
	repo repository.ReactionRepository
}

func NewReactionService(repo repository.ReactionRepository) *reactionService {
	return &reactionService{
		repo: repo,
	}
}

func (s *reactionService) FeedbackReaction(ctx context.Context, fbId uuid.UUID, userId string, req request.Reaction) error {
	if err := validator.Validate(req); err != nil {
		fmt.Println("validation error:", err)
		return err
	}

	if req.Type == request.RemoveReaction {
		if err := s.repo.RemoveFeedbackReaction(ctx, fbId, userId); err != nil {
			return err
		}

		return nil
	}

	reaction := &domain.FeedbackReaction{
		FeedbackID:   fbId,
		UserID:       userId,
		ReactionType: string(req.Type),
	}

	if err := s.repo.AddFeedbackReaction(ctx, reaction); err != nil {
		return err
	}

	return nil
}

func (s *reactionService) IdeaReaction(ctx context.Context, ideaId uuid.UUID, userId string, req request.Reaction) error {
	if err := validator.Validate(req); err != nil {
		return err
	}

	if req.Type == request.RemoveReaction {
		if err := s.repo.RemoveIdeaReaction(ctx, ideaId, userId); err != nil {
			return err
		}

		return nil
	}

	reaction := &domain.IdeaReaction{
		IdeaID:       ideaId,
		UserID:       userId,
		ReactionType: string(req.Type),
	}

	if err := s.repo.AddIdeaReaction(ctx, reaction); err != nil {
		return err
	}

	return nil
}
