package service

import (
	"context"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"
	"log"

	"github.com/google/uuid"
)

type FeedbackService interface {
	Add(ctx context.Context, parsedIdeaId uuid.UUID, parsedParentId *uuid.UUID, userId string, fb *request.CreateFeedback) (uuid.UUID, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) ([]response.IdeaComment, error)
}

type fbService struct {
	repo        repository.FeedbackRepository
	ideaRepo    repository.IdeaRepository
	broadcaster websocket.ActivityBroadcaster
}

func NewFeedbackService(repo repository.FeedbackRepository, ideaRepo repository.IdeaRepository,
	broadcaster websocket.ActivityBroadcaster) *fbService {
	return &fbService{
		repo:        repo,
		ideaRepo:    ideaRepo,
		broadcaster: broadcaster,
	}
}

func (s *fbService) Add(ctx context.Context, ideaId uuid.UUID, parsedParentId *uuid.UUID, userId string, req *request.CreateFeedback) (uuid.UUID, error) {
	fb := &domain.Feedback{
		IdeaID:  ideaId,
		UserID:  userId,
		Comment: req.Comment,
	}

	if parsedParentId != nil && *parsedParentId != uuid.Nil {
		fb.ParentID = parsedParentId
	}

	// ideaJSON, err := json.MarshalIndent(fb, "", "  ") // Marshal to JSON with indentation
	// if err != nil {
	// 	fmt.Println("Error marshalling idea to JSON:", err)
	// } else {
	// 	fmt.Println("Found idea (JSON):", string(ideaJSON))
	// }

	feedback, err := s.repo.Add(ctx, fb)
	if err != nil {
		return uuid.Nil, err
	}

	idea, _, err := s.ideaRepo.GetByID(ctx, ideaId, nil)
	if err != nil {
		log.Printf("Error fetching idea %s for broadcasting feedback: %v", ideaId, err)
		// Continue without broadcasting
		return feedback.ID, nil
	}

	if idea != nil && idea.UserID != "" {
		s.broadcaster.FormatAndBroadcastComment(idea.UserID, *feedback, idea.Title)
	} else {
		log.Printf("WARN: Could not broadcast feedback for idea %s, idea owner or title not found.", ideaId)
	}

	return feedback.ID, nil
}

func (s *fbService) GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) ([]response.IdeaComment, error) {
	feedbacks, err := s.repo.GetByIdea(ctx, ideaId)
	if err != nil {
		return nil, err
	}

	comments := dto.FeedbackToIdeaComments(feedbacks, userId)

	return comments, nil
}
