package repository

import (
	"context"
	"foundersignal/internal/domain"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AudienceRepository interface {
	GetForFounder(ctx context.Context, founderId string, queryParams domain.QueryParams) ([]*domain.AudienceMember, int64, error)
	Upsert(ctx context.Context, ideaID, mvpId uuid.UUID, userID string, userEmail string) (*domain.AudienceMember, error)
	GetByIdeaId(ctx context.Context, ideaId uuid.UUID) ([]*domain.AudienceMember, error)
	GetSignupsByIdeaIds(ctx context.Context, ideaIds []uuid.UUID, from, to time.Time) (map[uuid.UUID]map[string]int, error)
	GetRecentByUserIdeas(ctx context.Context, userID string, limit int) ([]domain.AudienceMember, error)
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID, from, to *time.Time) (int64, error)
	GetCountForIdeaOwner(ctx context.Context, ideaOwnerId string, start, end *time.Time) (int64, error)
}

type audienceRepository struct {
	db *gorm.DB
}

func NewAudienceRepo(db *gorm.DB) *audienceRepository {
	return &audienceRepository{db: db}
}

func (r *audienceRepository) GetForFounder(ctx context.Context, founderId string, queryParams domain.QueryParams) ([]*domain.AudienceMember, int64, error) {
	var audienceMembers []*domain.AudienceMember

	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Joins("JOIN ideas ON ideas.id = audience_members.idea_id").
		Where("ideas.user_id = ?", founderId)

	var tsQueryString string
	if queryParams.Search != "" {
		searchWords := strings.Fields(queryParams.Search)
		if len(searchWords) > 0 {
			searchWords[len(searchWords)-1] += ":*"
			tsQueryString = strings.Join(searchWords, " & ")

			query = query.Where(
				"(ideas.search_vector @@ to_tsquery('english', ?) OR to_tsvector('english', audience_members.user_email) @@ to_tsquery('english', ?))",
				tsQueryString, tsQueryString,
			)
		}
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}

	if count == 0 {
		return []*domain.AudienceMember{}, 0, nil
	}

	orderClause := "audience_members.signup_time DESC"
	switch queryParams.SortBy {
	case "newest":
		orderClause = "audience_members.signup_time DESC"
	case "oldest":
		orderClause = "audience_members.signup_time ASC"
	default:
		// default already set;
	}

	query = paginateAndOrder(query, queryParams.Limit, queryParams.Offset, orderClause)

	if queryParams.Search != "" {
		rankExpression := "ts_rank(ideas.search_vector, to_tsquery('english', ?)) + ts_rank(to_tsvector('english', audience_members.user_email), to_tsquery('english', ?))"
		query = query.Order(gorm.Expr(rankExpression+" DESC", tsQueryString, tsQueryString))
	}

	err = query.Preload("Idea").Find(&audienceMembers).Error
	if err != nil {
		return nil, 0, err
	}

	return audienceMembers, count, nil
}

func (r *audienceRepository) Upsert(ctx context.Context, ideaID, mvpId uuid.UUID, userID string, userEmail string) (*domain.AudienceMember, error) {
	member := domain.AudienceMember{
		IdeaID:         ideaID,
		MVPSimulatorID: mvpId,
		UserID:         userID,
		UserEmail:      userEmail,
	}

	now := time.Now()

	err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "idea_id"}, {Name: "user_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"last_active": gorm.Expr("NOW()"),
			"visits":      gorm.Expr("audience_members.visits + 1"),
			"engaged":     true,
		}),
	}).FirstOrCreate(&member, domain.AudienceMember{
		IdeaID:         ideaID,
		MVPSimulatorID: mvpId,
		UserID:         userID,
		UserEmail:      userEmail,
		SignupTime:     time.Now(),
		LastActive:     &now,
		Visits:         1,
		Engaged:        true,
	}).Error

	if err != nil {
		return nil, err
	}

	return &member, nil
}

func (r *audienceRepository) GetByIdeaId(ctx context.Context, ideaId uuid.UUID) ([]*domain.AudienceMember, error) {
	var audienceMembers []*domain.AudienceMember

	err := r.db.WithContext(ctx).Model(&domain.AudienceMember{}).Where("idea_id = ?", ideaId).Find(&audienceMembers).Error
	if err != nil {
		return nil, err
	}

	return audienceMembers, nil
}

// GetSignupsByIdeaIDs gets daily signup counts for a set of ideas
func (r *audienceRepository) GetSignupsByIdeaIds(ctx context.Context, ideaIds []uuid.UUID, from, to time.Time) (map[uuid.UUID]map[string]int, error) {
	type DailySignupPerIdea struct {
		IdeaID uuid.UUID `gorm:"column:idea_id"`
		Date   string    `gorm:"column:date"`
		Count  int       `gorm:"column:count"`
	}

	var results []DailySignupPerIdea

	if len(ideaIds) == 0 {
		return make(map[uuid.UUID]map[string]int), nil
	}

	query := r.db.WithContext(ctx).
		Table("audience_members").
		Select("idea_id, DATE(signup_time) as date, COUNT(*) as count").
		Where("idea_id IN (?) AND signup_time BETWEEN ? AND ?", ideaIds, from, to).
		Group("idea_id, DATE(signup_time)")

	if err := query.Find(&results).Error; err != nil {
		return nil, err
	}

	dailySignupsByIdea := make(map[uuid.UUID]map[string]int)
	for _, result := range results {
		if _, ok := dailySignupsByIdea[result.IdeaID]; !ok {
			dailySignupsByIdea[result.IdeaID] = make(map[string]int)
		}
		dailySignupsByIdea[result.IdeaID][result.Date] = result.Count
	}
	return dailySignupsByIdea, nil
}

// GetRecentByUserIdeas gets recent signups for all ideas of a user
func (r *audienceRepository) GetRecentByUserIdeas(ctx context.Context, userID string, limit int) ([]domain.AudienceMember, error) {
	var members []domain.AudienceMember

	query := r.db.WithContext(ctx).
		Joins("JOIN ideas ON audience_members.idea_id = ideas.id").
		Where("ideas.user_id = ?", userID).
		Order("audience_members.signup_time DESC").
		Limit(limit)

	if err := query.Find(&members).Error; err != nil {
		return nil, err
	}

	return members, nil
}

func (r *audienceRepository) GetCountByIdeaId(
	ctx context.Context,
	ideaId uuid.UUID,
	from, to *time.Time,
) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Where("idea_id = ?", ideaId)

	if from != nil && to != nil {
		query = query.Where("signup_time BETWEEN ? AND ?", *from, *to)
	} else if from != nil {
		query = query.Where("signup_time >= ?", *from)
	} else if to != nil {
		query = query.Where("signup_time <= ?", *to)
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *audienceRepository) GetCountForIdeaOwner(ctx context.Context, ideaOwnerId string, start, end *time.Time) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Joins("JOIN ideas ON ideas.id = audience_members.idea_id").
		Where("ideas.user_id = ?", ideaOwnerId)

	if start != nil && end != nil {
		query = query.Where("audience_members.signup_time BETWEEN ? AND ?", *start, *end)
	} else if start != nil {
		query = query.Where("audience_members.signup_time >= ?", *start)
	} else if end != nil {
		query = query.Where("audience_members.signup_time <= ?", *end)
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}
