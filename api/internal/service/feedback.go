package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/google/uuid"
)

type FeedbackService interface {
	Add(ctx context.Context, parsedIdeaId uuid.UUID, parsedParentId *uuid.UUID, userId string, fb *request.CreateFeedback) (uuid.UUID, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string, queryParams domain.QueryParams) (*response.IdeaCommentResponse, error)
	Delete(ctx context.Context, feedbackId uuid.UUID, userId string) error
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID) (int64, error)
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
		IdeaID:         ideaId,
		UserID:         userId,
		Comment:        req.Comment,
		SentimentScore: calculateSentiment(req.Comment),
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

func (s *fbService) GetByIdea(ctx context.Context, ideaId uuid.UUID, userId *string, queryParams domain.QueryParams) (*response.IdeaCommentResponse, error) {
	feedbacks, total, err := s.repo.GetByIdea(ctx, ideaId, &queryParams)
	if err != nil {
		return nil, err
	}

	comments := dto.FeedbackToIdeaComments(feedbacks, userId, total)

	return comments, nil
}

func (s *fbService) Delete(ctx context.Context, feedbackId uuid.UUID, userId string) error {
	feedback, err := s.repo.GetById(ctx, feedbackId)
	if err != nil {
		return err
	}

	if feedback.UserID != userId {
		return fmt.Errorf("user %s is not the author of feedback %s", userId, feedbackId)
	}

	err = s.repo.Delete(ctx, feedbackId)
	if err != nil {
		return err
	}

	return nil
}

func (s *fbService) GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID) (int64, error) {
	count, err := s.repo.GetCountByIdeaId(ctx, ideaId)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// example of a very naive keyword-based approach (for illustration only)
func calculateSentiment(comment string) float64 {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	lowerComment := strings.ToLower(comment)
	positiveKeywords := []string{"great", "love", "excellent", "good", "amazing"}
	negativeKeywords := []string{"bad", "terrible", "hate", "poor", "awful"}
	score := 0.5 // Start neutral

	for _, pk := range positiveKeywords {
		if strings.Contains(lowerComment, pk) {
			score += 0.1
		}
	}
	for _, nk := range negativeKeywords {
		if strings.Contains(lowerComment, nk) {
			score -= 0.1
		}
	}
	// Clamp score between 0.0 and 1.0
	if score > 1.0 {
		return 0.5 + r.Float64()*0.5
	}
	if score < 0.0 {
		return r.Float64() * 0.49
	}

	return score
}
