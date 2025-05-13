package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IdeaRepository interface {
	CreateWithMVP(ctx context.Context, idea *domain.Idea, mvp *domain.MVPSimulator) (uuid.UUID, error)
	GetIdeas(ctx context.Context, queryParams domain.QueryParams, spec IdeaQuerySpec) ([]*domain.Idea, int64, error)
	GetByID(ctx context.Context, id uuid.UUID, getRelatedIdeas *bool) (*domain.Idea, []*domain.Idea, error)
	// GetByUserId(ctx context.Context, userId string) ([]*domain.Idea, error)
	GetIdeasWithActivity(ctx context.Context, userID string, from, to time.Time, options ...QueryOption) ([]*response.IdeaWithActivity, error)
	// GetTopIdeas(ctx context.Context, userId string, days int, queryParams domain.QueryParams) ([]*response.IdeaWithActivity, error)

	// utils
	VerifyIdeaOwner(ctx context.Context, ideaID uuid.UUID, userID string) (bool, error)
}

type IdeaQuerySpec struct {
	Status     domain.IdeaStatus
	WithCounts bool
	ByUserId   string
}

type ideaRepository struct {
	db *gorm.DB
}

func NewIdeasRepo(db *gorm.DB) *ideaRepository {
	return &ideaRepository{db: db}
}

// create both the idea and the MVP simulator
func (r *ideaRepository) CreateWithMVP(ctx context.Context, idea *domain.Idea, mvp *domain.MVPSimulator) (uuid.UUID, error) {
	var ideaID uuid.UUID

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(idea).Error; err != nil {
			fmt.Println("Validation error:", err)
			return err
		}

		ideaID = idea.ID

		mvp.IdeaID = ideaID
		if err := tx.Create(mvp).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return uuid.Nil, err
	}

	return idea.ID, nil
}

func (r *ideaRepository) GetIdeas(ctx context.Context, queryParams domain.QueryParams, spec IdeaQuerySpec) ([]*domain.Idea, int64, error) {
	query := r.db.WithContext(ctx).Model(&domain.Idea{})

	if spec.Status != "" {
		query = query.Where("status = ?", spec.Status)
	}

	if spec.ByUserId != "" {
		query = query.Where("user_id = ?", spec.ByUserId)
	}

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if spec.WithCounts {
		query = r.withCounts(query)
	}

	query = r.paginateAndOrder(query, queryParams.Limit, queryParams.Offset, queryParams.Order)

	var ideas []*domain.Idea
	if err := query.Find(&ideas).Error; err != nil {
		return nil, 0, err
	}

	return ideas, totalCount, nil
}

func (r *ideaRepository) GetByID(ctx context.Context, id uuid.UUID, getRelatedIdeas *bool) (*domain.Idea, []*domain.Idea, error) {
	query := r.db.WithContext(ctx).Model(&domain.Idea{}).Where("id = ?", id).
		Preload("Feedback", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Reactions")
		}).
		Preload("Reactions").
		Preload("Signals")

	query = r.withCounts(query)

	idea := &domain.Idea{}
	if err := query.Find(idea).Error; err != nil {
		fmt.Println("Error finding idea:", err)
		return nil, nil, err
	}

	if idea.Status != string(domain.IdeaStatusActive) {
		return nil, nil, gorm.ErrRecordNotFound
	}

	var relatedIdeas []*domain.Idea
	if getRelatedIdeas != nil && *getRelatedIdeas {
		relatedIdeas = r.getRelatedIdeas(ctx, *idea)
	}

	return idea, relatedIdeas, nil
}

// GetByUserId gets all ideas for a user
func (r *ideaRepository) GetByUserId(ctx context.Context, userId string) ([]*domain.Idea, error) {
	var ideas []*domain.Idea

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userId).
		Find(&ideas).Error; err != nil {
		return nil, err
	}

	return ideas, nil
}

// GetIdeasWithActivity fetches ideas with activity metrics for a time range
func (r *ideaRepository) GetIdeasWithActivity(ctx context.Context, userID string, from, to time.Time, options ...QueryOption) ([]*response.IdeaWithActivity, error) {
	var ideasWithActivity []*response.IdeaWithActivity

	// Build subqueries for views and signups
	signupsSub := r.db.
		Select("idea_id, COUNT(*) as signups, MAX(signup_time) as latest_signup").
		Table("audience_members").
		Where("signup_time BETWEEN ? AND ?", from, to).
		Group("idea_id")

	viewsSub := r.db.
		Select("idea_id, COUNT(*) as views, MAX(created_at) as latest_view").
		Table("signals").
		Where("event_type = ? AND created_at BETWEEN ? AND ?", domain.EventTypePageView, from, to).
		Group("idea_id")

	// Main query
	query := r.db.WithContext(ctx).
		Model(&domain.Idea{}).
		Select("ideas.*, COALESCE(s.signups, 0) as signups, COALESCE(v.views, 0) as views, s.latest_signup, v.latest_view").
		Joins("LEFT JOIN (?) as s ON ideas.id = s.idea_id", signupsSub).
		Joins("LEFT JOIN (?) as v ON ideas.id = v.idea_id", viewsSub).
		Where("ideas.user_id = ?", userID)

	// Apply any additional options
	for _, option := range options {
		query = option(query)
	}

	if err := query.Find(&ideasWithActivity).Error; err != nil {
		return nil, err
	}

	return ideasWithActivity, nil
}

// GetTopIdeas retrieves ideas ranked by views and signups within a specified number of days.
// Note: This query intentionally uses JOINs and database-level aggregation for performance
// in fetching and ranking top ideas, rather than fetching all data and processing in the service layer.
// func (r *ideaRepository) GetTopIdeas(ctx context.Context, userId string, days int, queryParams domain.QueryParams) ([]*response.IdeaWithActivity, error) {
// 	var ideas []*response.IdeaWithActivity
// 	since := time.Now().AddDate(0, 0, -days)

// 	// Subquery for signups
// 	signupsSub := r.db.
// 		Select("idea_id, COUNT(*) as signups, MAX(signup_time) as latest_signup").
// 		Table("audience_members").
// 		Where("signup_time >= ?", since).
// 		Group("idea_id")

// 	// Subquery for views
// 	viewsSub := r.db.
// 		Select("idea_id, COUNT(*) as views, MAX(created_at) as latest_view").
// 		Table("signals").
// 		Where("event_type = ? AND created_at >= ?", domain.EventTypePageView, since).
// 		Group("idea_id")

// 	// Join subqueries to ideas and order by counts
// 	err := r.db.WithContext(ctx).
// 		Table("ideas").
// 		Select("ideas.*, COALESCE(s.signups, 0) as signups, COALESCE(v.views, 0) as views").
// 		Joins("LEFT JOIN (?) as s ON ideas.id = s.idea_id", signupsSub).
// 		Joins("LEFT JOIN (?) as v ON ideas.id = v.idea_id", viewsSub).
// 		Where("ideas.user_id = ?", userId).
// 		Order("views DESC, signups DESC").
// 		Limit(queryParams.Limit).
// 		Offset(queryParams.Offset).
// 		Scan(&ideas).Error

// 	if err != nil {
// 		return nil, err
// 	}

// 	return ideas, nil
// }

func (r *ideaRepository) VerifyIdeaOwner(ctx context.Context, ideaID uuid.UUID, userID string) (bool, error) {
	var idea domain.Idea

	err := r.db.WithContext(ctx).
		Select("user_id").
		First(&idea, "id = ?", ideaID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}

	return idea.UserID == userID, nil
}

func (r *ideaRepository) paginateAndOrder(query *gorm.DB, limit, offset int, order string) *gorm.DB {
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}
	if order != "" {
		query = query.Order(order)
	} else {
		query = query.Order("created_at DESC")
	}
	return query
}

func (r *ideaRepository) getRelatedIdeas(ctx context.Context, idea domain.Idea) []*domain.Idea {
	var relatedIdeas []*domain.Idea
	tokens := simpleTokenizer(idea.TargetAudience)

	if len(tokens) > 0 {
		var scoreClauses []string
		var whereClauses []string
		var queryArgs []interface{}

		for _, token := range tokens {
			likePattern := "%" + token + "%"
			scoreClauses = append(scoreClauses, "(CASE WHEN LOWER(target_audience) LIKE ? THEN 1 ELSE 0 END)")
			whereClauses = append(whereClauses, "LOWER(target_audience) LIKE ?")
			queryArgs = append(queryArgs, likePattern)
		}

		for _, token := range tokens {
			likePattern := "%" + token + "%"
			queryArgs = append(queryArgs, likePattern)
		}

		matchScoreSQL := strings.Join(scoreClauses, " + ")
		whereSQL := strings.Join(whereClauses, " OR ")

		relatedIdeasQuery := r.db.WithContext(ctx).Model(&domain.Idea{})
		relatedIdeasQuery = r.withCounts(relatedIdeasQuery)

		currentSelect := "ideas.*, COALESCE(v.view_count, 0) as views, COALESCE(s.signup_count, 0) as signups"
		finalSelect := fmt.Sprintf("%s, (%s) as match_score", currentSelect, matchScoreSQL)

		relatedIdeasQuery = relatedIdeasQuery.
			Select(finalSelect, queryArgs[:len(tokens)]...).
			Where("ideas.id != ? AND ideas.status = ?", idea.ID, domain.IdeaStatusActive).
			Where(whereSQL, queryArgs[len(tokens):]...).
			Order("match_score DESC, COALESCE(s.signup_count, 0) DESC").
			Limit(3)

		if err := relatedIdeasQuery.Find(&relatedIdeas).Error; err != nil {
			fmt.Println("Error finding related ideas with tokenization:", err)
			relatedIdeas = nil
		}
	} else {
		fallbackQuery := r.db.WithContext(ctx).Model(&domain.Idea{})
		fallbackQuery = r.withCounts(fallbackQuery)
		fallbackQuery = fallbackQuery.
			Where("id != ? AND status = ?", idea.ID, domain.IdeaStatusActive).
			Where("target_audience LIKE ?", "%"+idea.TargetAudience+"%").
			Order("views DESC").
			Limit(3)

		if err := fallbackQuery.Find(&relatedIdeas).Error; err != nil {
			fmt.Println("Error finding related ideas (fallback):", err)
			relatedIdeas = nil
		}
	}

	return relatedIdeas
}

// func WithMVPSimulator(fields ...string) QueryOption {
// 	return func(db *gorm.DB) *gorm.DB {
// 		if len(fields) > 0 {
// 			return db.Preload("MVPSimulator", selectFields(fields))
// 		}

// 		return db.Preload("MVPSimulator")
// 	}
// }

// func WithFeedback(fields ...string) QueryOption {
// 	return func(db *gorm.DB) *gorm.DB {
// 		if len(fields) > 0 {
// 			return db.Preload("Feedback", selectFields(fields))
// 		}

// 		return db.Preload("Feedback")
// 	}
// }

func (r *ideaRepository) withCounts(query *gorm.DB) *gorm.DB {
	views := r.db.Model(&domain.Signal{}).
		Select("idea_id, COUNT(*) as view_count").
		Where("event_type = ?", domain.EventTypePageView).
		Group("idea_id")

	signups := r.db.Model(&domain.AudienceMember{}).
		Select("idea_id, COUNT(DISTINCT user_id) as signup_count").
		Group("idea_id")

	return query.
		Select("ideas.*, COALESCE(v.view_count, 0) as views, COALESCE(s.signup_count, 0) as signups").
		Joins("LEFT JOIN (?) as v ON ideas.id = v.idea_id", views).
		Joins("LEFT JOIN (?) as s ON ideas.id = s.idea_id", signups)
}

func simpleTokenizer(text string) []string {
	words := strings.Fields(strings.ToLower(text))
	var tokens []string
	for _, word := range words {
		cleanedWord := strings.Trim(word, ".,!?;:")
		if cleanedWord != "" {
			tokens = append(tokens, cleanedWord)
		}
	}
	return tokens
}
