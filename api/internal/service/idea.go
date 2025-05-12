package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/repository"
	"foundersignal/pkg/validator"

	"github.com/google/uuid"
)

type IdeaService interface {
	Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error)
	GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error)
	// GetUserIdeas(ctx context.Context, userId string, queryParams domain.QueryParams) ([]*response.IdeaList, error)
	GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error)
	// UpdateMVP(ctx context.Context, mvpId, ideaId uuid.UUID, userId string, req *request.UpdateMVP) error
	// GetTopIdeas(ctx context.Context, userId string, queryParams domain.QueryParams) ([]response.PrivateTopIdeaList, error)
}

type ideaService struct {
	repo         repository.IdeaRepository
	signalRepo   repository.SignalRepository
	audienceRepo repository.AudienceRepository
}

func NewIdeasService(repo repository.IdeaRepository, signalRepo repository.SignalRepository,
	audienceRepo repository.AudienceRepository) *ideaService {
	return &ideaService{
		repo:         repo,
		signalRepo:   signalRepo,
		audienceRepo: audienceRepo,
	}
}

func (s *ideaService) Create(ctx context.Context, userId string, req *request.CreateIdea) (uuid.UUID, error) {
	if err := validator.Validate(req); err != nil {
		return uuid.Nil, err
	}

	idea := &domain.Idea{
		UserID:         userId,
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

func (s *ideaService) GetByID(ctx context.Context, id uuid.UUID, userId string) (*response.PublicIdeaResponse, error) {
	idea, relatedIdeas, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// ideaJSON, err := json.MarshalIndent(idea, "", "  ") // Marshal to JSON with indentation
	// if err != nil {
	// 	fmt.Println("Error marshalling idea to JSON:", err)
	// 	// Decide if you want to return the error or just log it and proceed
	// } else {
	// 	fmt.Println("Found idea (JSON):", string(ideaJSON))
	// }

	publicIdea := dto.ToPublicIdea(idea, relatedIdeas, userId)

	return publicIdea, nil
}

// // func to get idea by id for dashboard
// func (s *ideaService) GetByIDForDashboard(ctx context.Context, id uuid.UUID) (*response.DashboardIdea, error) {
// 	idea, err := s.GetByID(ctx, id)
// 	if err != nil {
// 		return nil, err
// 	}

// 	now := time.Now()
// 	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
// 	eventType := domain.EventTypePageView

// 	signals, err := s.signalRepo.GetCountByIdeaId(ctx, idea.ID, &eventType, &sevenDaysAgo, &now, nil)
// 	if err != nil {
// 		return nil, err
// 	}

// 	audience, err := s.audienceRepo.GetCountByIdeaId(ctx, idea.ID, &sevenDaysAgo, &now, nil)
// 	if err != nil {
// 		return nil, err
// 	}

// 	res := &response.DashboardIdea{
// 		Idea: *idea,
// 	}
// }

func (s *ideaService) GetIdeas(ctx context.Context, queryParams domain.QueryParams) (*response.IdeaListResponse, error) {
	ideasRaw, totalCount, err := s.repo.GetIdeas(ctx, queryParams, repository.IdeaQuerySpec{
		Status:     domain.IdeaStatusActive,
		WithCounts: true,
	})
	if err != nil {
		return nil, err
	}

	ideas := dto.ToIdeasListResponse(ideasRaw, totalCount)

	return ideas, nil
}

// func (s *ideaService) GetById(ctx context.Context, id uuid.UUID) (*domain.Idea, error) {
// 	idea, err := s.repo.GetByID(ctx, id)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return idea, nil
// }

// func (s *ideaService) UpdateMVP(ctx context.Context, mvpId, ideaId uuid.UUID, userId string, req *request.UpdateMVP) error {
// 	isCreator, err := s.repo.VerifyIdeaOwner(ctx, ideaId, userId)
// 	if err != nil {
// 		return err
// 	}

// 	if !isCreator {
// 		return errors.New("unauthorized: you don't have permission to update this MVP")
// 	}

// 	var mvp domain.MVPSimulator

// 	if req.Headline != "" {
// 		mvp.Headline = req.Headline
// 	}

// 	if req.Subheadline != "" {
// 		mvp.Subheadline = req.Subheadline
// 	}

// 	if req.CTAButton != "" {
// 		mvp.CTAButton = req.CTAButton
// 	}

// 	if req.CTAText != "" {
// 		mvp.CTAText = req.CTAText
// 	}

// 	return s.repo.UpdateMVP(ctx, mvpId, &mvp)
// }

// func (s *ideaService) GetTopIdeas(ctx context.Context, userId string, queryParams domain.QueryParams) ([]response.PrivateTopIdeaList, error) {

// 	topIdeas, err := s.repo.GetTopIdeas(ctx, userId, 7, queryParams)
// 	if err != nil {
// 		return nil, err
// 	}

// 	var result []response.PrivateTopIdeaList
// 	for _, idea := range topIdeas {
// 		result = append(result, response.PrivateTopIdeaList{
// 			ID:    idea.ID,
// 			Title: idea.Title,
// 			IdeaActivity: response.IdeaActivity{
// 				Signups: idea.Signups,
// 				Views:   idea.Views,
// 				Date:    idea.CreatedAt.Format("2006-01-02"),
// 			},
// 		})
// 	}

// 	return result, nil
// }

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
