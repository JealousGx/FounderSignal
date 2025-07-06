package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/pkg/reddit"
	"foundersignal/internal/repository"
	"log"
	"time"

	"github.com/google/uuid"
)

type RedditValidationService interface {
	GenerateValidation(ctx context.Context, userID string, ideaId uuid.UUID) (uuid.UUID, error)
	GetValidation(ctx context.Context, validationID uuid.UUID) (*response.RedditValidationResponse, error)
	GetValidationsForUser(ctx context.Context, userID string, queryParams domain.QueryParams) (*response.RedditValidationListResponse, error)
	ProcessValidationAsync(ctx context.Context, validationID uuid.UUID)
}

type redditValidationService struct {
	validationRepo repository.RedditValidationRepository
	ideaRepo       repository.IdeaRepository
	redditClient   *reddit.RedditClient
	analyzer       *ValidationAnalyzer
}

func NewRedditValidationService(
	validationRepo repository.RedditValidationRepository,
	ideaRepo repository.IdeaRepository,
	redditClient *reddit.RedditClient,
	analyzer *ValidationAnalyzer,
) RedditValidationService {
	return &redditValidationService{
		validationRepo: validationRepo,
		ideaRepo:       ideaRepo,
		redditClient:   redditClient,
		analyzer:       analyzer,
	}
}

func (s *redditValidationService) GenerateValidation(ctx context.Context, userID string, ideaId uuid.UUID) (uuid.UUID, error) {
	// Verify idea ownership
	idea, _, err := s.ideaRepo.GetByID(ctx, ideaId, nil)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to get idea: %w", err)
	}
	if idea.UserID != userID {
		return uuid.Nil, fmt.Errorf("unauthorized access to idea")
	}

	// Check if validation already exists
	existingValidation, err := s.validationRepo.GetByIdeaID(ctx, ideaId)
	if err == nil && existingValidation != nil {
		return existingValidation.ID, nil
	}

	// Create new validation record
	validation := &domain.RedditValidation{
		IdeaID:    ideaId,
		IdeaTitle: idea.Title,
		UserID:    userID,
		Status:    domain.ValidationStatusProcessing,
	}

	validationID, err := s.validationRepo.Create(ctx, validation)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create validation: %w", err)
	}

	err = s.ideaRepo.Update(ctx, &domain.Idea{
		Base: domain.Base{
			ID: ideaId,
		},
		RedditValidationID: validationID,
	})
	if err != nil {
		fmt.Printf("Failed to update idea with validation ID: %v\n", err)
	}

	// Start async processing
	go s.ProcessValidationAsync(context.Background(), validationID)

	return validationID, nil
}

func (s *redditValidationService) ProcessValidationAsync(ctx context.Context, validationID uuid.UUID) {
	// Get validation record
	validation, err := s.validationRepo.GetByID(ctx, validationID)
	if err != nil {
		log.Printf("Failed to get validation %s: %v", validationID, err)
		return
	}

	// Get idea details
	idea, _, err := s.ideaRepo.GetByID(ctx, validation.IdeaID, nil)
	if err != nil {
		s.updateValidationError(validation, fmt.Sprintf("Failed to get idea: %v", err))
		return
	}

	// Define relevant subreddits
	subreddits := []string{
		"startups", "entrepreneur", "smallbusiness", "business", "marketing",
		"productivity", "technology", "saas", "webdev", "programming",
	}

	// Search Reddit for relevant posts
	searchQuery := fmt.Sprintf("%s %s", idea.Title, idea.Description)
	posts, err := s.redditClient.SearchPosts(ctx, searchQuery, subreddits, 200)
	if err != nil {
		s.updateValidationError(validation, fmt.Sprintf("Failed to fetch Reddit data: %v", err))
		return
	}

	if len(posts) == 0 {
		s.updateValidationError(validation, "No relevant Reddit posts found")
		return
	}

	// Convert to domain model
	var redditPosts []reddit.RedditPost
	for _, post := range posts {
		redditPosts = append(redditPosts, reddit.RedditPost{
			ID:                post.ID,
			Title:             post.Title,
			Selftext:          post.Selftext,
			Author:            post.Author,
			Score:             post.Score,
			Comments:          post.Comments,
			Subreddit:         post.Subreddit,
			Created:           post.Created,
			URL:               post.URL,
			IsOriginalContent: post.IsOriginalContent,
			Permalink:         post.Permalink,
			IsOver18:          post.IsOver18,
			UpvoteRatio:       post.UpvoteRatio,
		})
	}

	// Analyze with AI
	analysis, err := s.analyzer.AnalyzeRedditData(ctx, idea.Title, idea.Description, redditPosts)
	if err != nil {
		s.updateValidationError(validation, fmt.Sprintf("Failed to analyze data: %v", err))
		return
	}

	// Update validation with results
	now := time.Now()
	validation.Status = domain.ValidationStatusCompleted
	validation.ProcessedAt = &now
	validation.ValidationScore = analysis.ValidationScore

	// Convert analysis to JSON
	validation.MarketAssessment, _ = json.Marshal(analysis.MarketAssessment)
	validation.ExecutiveSummary = analysis.ExecutiveSummary
	validation.InsightDensity, _ = json.Marshal(analysis.InsightDensity)
	validation.SubredditAnalysis, _ = json.Marshal(analysis.SubredditAnalysis)
	validation.KeyPatterns, _ = json.Marshal(analysis.KeyPatterns)
	validation.VoiceOfCustomer, _ = json.Marshal(analysis.VoiceOfCustomer)
	validation.CompetitiveLandscape, _ = json.Marshal(analysis.CompetitiveLandscape)
	validation.EmergingTrends, _ = json.Marshal(analysis.EmergingTrends)
	validation.StartupOpportunities, _ = json.Marshal(analysis.StartupOpportunities)
	validation.TopRedditThreads, _ = json.Marshal(analysis.TopRedditThreads)

	if err := s.validationRepo.Update(ctx, validation); err != nil {
		log.Printf("Failed to update validation %s: %v", validationID, err)
	}
}

func (s *redditValidationService) updateValidationError(validation *domain.RedditValidation, errorMsg string) {
	validation.Status = domain.ValidationStatusFailed
	validation.Error = errorMsg

	ctx := context.Background()

	if err := s.validationRepo.Update(ctx, validation); err != nil {
		log.Printf("Failed to update validation error: %v", err)
	}
}

func (s *redditValidationService) GetValidation(ctx context.Context, validationID uuid.UUID) (*response.RedditValidationResponse, error) {
	validation, err := s.validationRepo.GetByID(ctx, validationID)
	if err != nil {
		return nil, err
	}

	return s.convertToResponse(validation), nil
}

func (s *redditValidationService) GetValidationsForUser(ctx context.Context, userID string, queryParams domain.QueryParams) (*response.RedditValidationListResponse, error) {
	validations, total, err := s.validationRepo.GetForUser(ctx, userID, queryParams)
	if err != nil {
		return nil, err
	}

	var responses []response.RedditValidationResponse
	for _, validation := range validations {
		responses = append(responses, *s.convertToResponse(validation))
	}

	return &response.RedditValidationListResponse{
		Validations: responses,
		Total:       total,
	}, nil
}

func (s *redditValidationService) convertToResponse(validation *domain.RedditValidation) *response.RedditValidationResponse {
	return &response.RedditValidationResponse{
		ID:               validation.ID,
		IdeaID:           validation.IdeaID,
		IdeaTitle:        validation.IdeaTitle,
		Status:           validation.Status,
		ValidationScore:  validation.ValidationScore,
		ExecutiveSummary: validation.ExecutiveSummary,
		ProcessedAt:      validation.ProcessedAt,
		Error:            validation.Error,
		// Parse JSON fields
		MarketAssessment:     s.parseJSON(validation.MarketAssessment),
		InsightDensity:       s.parseJSON(validation.InsightDensity),
		SubredditAnalysis:    s.parseJSON(validation.SubredditAnalysis),
		KeyPatterns:          s.parseJSON(validation.KeyPatterns),
		VoiceOfCustomer:      s.parseJSON(validation.VoiceOfCustomer),
		CompetitiveLandscape: s.parseJSON(validation.CompetitiveLandscape),
		EmergingTrends:       s.parseJSON(validation.EmergingTrends),
		StartupOpportunities: s.parseJSON(validation.StartupOpportunities),
		TopRedditThreads:     s.parseJSON(validation.TopRedditThreads),
	}
}

func (s *redditValidationService) parseJSON(data []byte) interface{} {
	if len(data) == 0 {
		return nil
	}
	var result interface{}
	json.Unmarshal(data, &result)
	return result
}
