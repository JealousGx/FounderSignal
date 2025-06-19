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
	Update(ctx context.Context, idea *domain.Idea) error
	Delete(ctx context.Context, ideaId uuid.UUID) error
	GetIdeas(ctx context.Context, queryParams domain.QueryParams, spec IdeaQuerySpec) ([]*domain.Idea, int64, error)
	GetByID(ctx context.Context, id uuid.UUID, getRelatedIdeas *bool) (*domain.Idea, []*domain.Idea, error)
	GetByIds(ctx context.Context, ids []uuid.UUID) ([]*domain.Idea, error)
	GetIdeasWithActivity(ctx context.Context, userID string, from, to time.Time, options ...QueryOption) ([]*response.IdeaWithActivity, error)
	GetCountForUser(ctx context.Context, userId string, start, end *time.Time, status *domain.IdeaStatus) (int64, error)
}

type IdeaQuerySpec struct {
	IncludePrivate *bool
	Status         domain.IdeaStatus
	WithCounts     bool
	ByUserId       string
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
		searchableText := fmt.Sprintf("%s %s %s", idea.Title, idea.Description, idea.TargetAudience)
		if err := tx.Model(idea).UpdateColumn("search_vector", gorm.Expr("to_tsvector('english', ?)", searchableText)).Error; err != nil {
			return err
		}

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

func (r *ideaRepository) Update(ctx context.Context, idea *domain.Idea) error {

	if err := r.db.WithContext(ctx).Model(idea).Updates(idea).Error; err != nil {
		fmt.Println("Error updating idea:", err)

		return err
	}

	if idea.Title != "" || idea.Description != "" || idea.TargetAudience != "" {
		searchableText := fmt.Sprintf("%s %s %s", idea.Title, idea.Description, idea.TargetAudience)
		if err := r.db.WithContext(ctx).Model(idea).UpdateColumn("search_vector", gorm.Expr("to_tsvector('english', ?)", searchableText)).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *ideaRepository) Delete(ctx context.Context, ideaId uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Idea{}, ideaId).Error; err != nil {
		fmt.Println("Error deleting idea:", err)
		return err
	}

	return nil
}

func (r *ideaRepository) GetIdeas(ctx context.Context, queryParams domain.QueryParams, spec IdeaQuerySpec) ([]*domain.Idea, int64, error) {
	query := r.db.WithContext(ctx).Model(&domain.Idea{})

	if spec.Status != "" {
		query = query.Where("status = ?", spec.Status)
	}

	if spec.ByUserId != "" {
		query = query.Where("user_id = ?", spec.ByUserId)
	}

	if spec.IncludePrivate != nil {
		query = query.Where("is_private = ?", *spec.IncludePrivate)
	}

	var tsQueryString string
	if queryParams.Search != "" {
		searchWords := strings.Fields(queryParams.Search)
		if len(searchWords) > 0 {
			searchWords[len(searchWords)-1] += ":*"
			tsQueryString = strings.Join(searchWords, " & ")
			query = query.Where("search_vector @@ to_tsquery('english', ?)", tsQueryString)
		}
	}

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	orderClause := "created_at DESC"
	needsCountsForSort := false

	switch queryParams.SortBy {
	case "newest":
		orderClause = "created_at DESC"
	case "oldest":
		orderClause = "created_at ASC"
	case "views":
		orderClause = "views DESC"
		needsCountsForSort = true
	case "signups":
		orderClause = "signups DESC"
		needsCountsForSort = true
	default:
		// default already set;
	}

	if spec.WithCounts || needsCountsForSort {
		// for sorting by views or signups, we need to join the counts
		query = r.withCounts(query)
	}

	query = paginateAndOrder(query, queryParams.Limit, queryParams.Offset, orderClause)

	if queryParams.Search != "" {
		query = query.Order(gorm.Expr("ts_rank(search_vector, to_tsquery('english', ?)) DESC", tsQueryString))
	}

	var ideas []*domain.Idea
	if err := query.Find(&ideas).Error; err != nil {
		fmt.Println("Error finding ideas:", err)
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
		Preload("Signals").
		Preload("AudienceMembers")

	idea := &domain.Idea{}
	if err := query.Find(idea).Error; err != nil {
		fmt.Println("Error finding idea:", err)
		return nil, nil, err
	}

	var relatedIdeas []*domain.Idea
	if getRelatedIdeas != nil && *getRelatedIdeas {
		relatedIdeas = r.getRelatedIdeas(ctx, *idea)
	}

	return idea, relatedIdeas, nil
}

func (r *ideaRepository) GetByIds(ctx context.Context, ids []uuid.UUID) ([]*domain.Idea, error) {
	var ideas []*domain.Idea

	if len(ids) == 0 {
		return ideas, nil
	}

	if err := r.db.WithContext(ctx).
		Where("id IN ?", ids).
		Find(&ideas).Error; err != nil {
		return nil, err
	}

	return ideas, nil
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

func (r *ideaRepository) GetCountForUser(ctx context.Context, userId string, start, end *time.Time, status *domain.IdeaStatus) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&domain.Idea{}).
		Where("user_id = ?", userId)

	if status != nil {
		query = query.Where("status = ?", *status)
	}

	if start != nil && end != nil {
		query = query.Where("created_at BETWEEN ? AND ?", *start, *end)
	} else if start != nil {
		query = query.Where("created_at >= ?", *start)
	} else if end != nil {
		query = query.Where("created_at <= ?", *end)
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *ideaRepository) getRelatedIdeas(ctx context.Context, idea domain.Idea) []*domain.Idea {
	var relatedIdeas []*domain.Idea
	baseQuery := r.db.WithContext(ctx).Model(&domain.Idea{}).
		Preload("Signals").
		Preload("AudienceMembers").
		Limit(3)

	baseQuery = r.withCounts(baseQuery)

	tokens := simpleTokenizer(idea.Title + " " + idea.TargetAudience)

	if len(tokens) == 0 {
		return nil
	}

	tsQueryString := strings.Join(tokens, " | ")

	selectWithRelevance := fmt.Sprintf("%s, ts_rank(search_vector, to_tsquery('english', ?)) as relevance", r.withCountsSelectClause())

	relatedIdeasQuery := baseQuery.
		Select(selectWithRelevance, tsQueryString).
		Where("ideas.id != ? AND ideas.status = ? AND search_vector @@ to_tsquery('english', ?)", idea.ID, domain.IdeaStatusActive, tsQueryString).
		Order("relevance DESC, signups DESC").
		Limit(3)

	if err := relatedIdeasQuery.Find(&relatedIdeas).Error; err != nil {
		fmt.Println("Error finding related ideas using FTS:", err)
		return nil
	}

	return relatedIdeas
}

func (r *ideaRepository) withCounts(query *gorm.DB) *gorm.DB {
	views := r.db.Model(&domain.Signal{}).
		Select("idea_id, COUNT(*) as view_count").
		Where("event_type = ?", domain.EventTypePageView).
		Group("idea_id")

	signups := r.db.Model(&domain.AudienceMember{}).
		Select("idea_id, COUNT(DISTINCT user_id) as signup_count").
		Group("idea_id")

	fullSelectClause := r.withCountsSelectClause()

	return query.
		Select(fullSelectClause).
		Joins("LEFT JOIN (?) as v ON ideas.id = v.idea_id", views).
		Joins("LEFT JOIN (?) as s ON ideas.id = s.idea_id", signups)
}

func (r *ideaRepository) withCountsSelectClause() string {
	selectIdeaFields := []string{
		"ideas.id", "ideas.created_at", "ideas.updated_at", "ideas.deleted_at",
		"ideas.user_id",
		"ideas.title",
		"ideas.description",
		"ideas.target_audience",
		"ideas.status",
		"ideas.stage",
		"ideas.target_signups",
		"ideas.image_url",
		"ideas.likes",
		"ideas.dislikes",
	}

	var fullSelectParts []string
	fullSelectParts = append(fullSelectParts, selectIdeaFields...)
	fullSelectParts = append(fullSelectParts, "COALESCE(v.view_count, 0) as views")
	fullSelectParts = append(fullSelectParts, "COALESCE(s.signup_count, 0) as signups")

	return strings.Join(fullSelectParts, ", ")
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
