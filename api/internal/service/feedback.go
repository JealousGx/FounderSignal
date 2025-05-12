package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"

	"github.com/google/uuid"
)

type FeedbackService interface {
	Add(ctx context.Context, parsedIdeaId uuid.UUID, parsedParentId *uuid.UUID, userId string, fb *request.CreateFeedback) (uuid.UUID, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) ([]response.IdeaComment, error)
}

type fbService struct {
	repo repository.FeedbackRepository
}

func NewFeedbackService(repo repository.FeedbackRepository) *fbService {
	return &fbService{
		repo: repo,
	}
}

func (s *fbService) Add(ctx context.Context, parsedIdeaId uuid.UUID, parsedParentId *uuid.UUID, userId string, req *request.CreateFeedback) (uuid.UUID, error) {
	fb := &domain.Feedback{
		IdeaID:  parsedIdeaId,
		UserID:  userId,
		Comment: req.Comment,
	}

	if parsedParentId != nil && *parsedParentId != uuid.Nil {
		fb.ParentID = parsedParentId
	}

	ideaJSON, err := json.MarshalIndent(fb, "", "  ") // Marshal to JSON with indentation
	if err != nil {
		fmt.Println("Error marshalling idea to JSON:", err)
	} else {
		fmt.Println("Found idea (JSON):", string(ideaJSON))
	}

	return s.repo.Add(ctx, fb)
}

func (s *fbService) GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string) ([]response.IdeaComment, error) {
	feedbacks, err := s.repo.GetByIdea(ctx, ideaId)
	if err != nil {
		return nil, err
	}

	comments := dto.FeedbackToIdeaComments(feedbacks, userId)

	return comments, nil
}
