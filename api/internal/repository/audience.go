package repository

import (
	"context"
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AudienceRepository interface {
	Upsert(ctx context.Context, ideaID uuid.UUID, userID string) (*domain.AudienceMember, error)
	GetByIdeaId(ctx context.Context, ideaId uuid.UUID) ([]*domain.AudienceMember, error)
	GetSignupsByIdeaId(ctx context.Context, ideaId uuid.UUID, from, to time.Time) ([]int64, error)
	GetSignupsByIdeaIds(ctx context.Context, ideaIds []uuid.UUID, from, to time.Time) (map[uuid.UUID]map[string]int, error)
	GetRecentByUserIdeas(ctx context.Context, userID string, limit int) ([]domain.AudienceMember, error)
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID, from, to *time.Time) (int64, error)
}

type audienceRepository struct {
	db *gorm.DB
}

func NewAudienceRepo(db *gorm.DB) *audienceRepository {
	return &audienceRepository{db: db}
}

func (r *audienceRepository) Upsert(ctx context.Context, ideaID uuid.UUID, userID string) (*domain.AudienceMember, error) {
	member := domain.AudienceMember{
		IdeaID: ideaID,
		UserID: userID,
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
		IdeaID:     ideaID,
		UserID:     userID,
		SignupTime: time.Now(),
		LastActive: &now,
		Visits:     1,
		Engaged:    true,
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

func (r *audienceRepository) GetSignupsByIdeaId(
	ctx context.Context,
	ideaId uuid.UUID,
	from, to time.Time,
) ([]int64, error) {
	var results []int64

	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Select("DATE(signup_time) as date, COUNT(*) as signups").
		Where("idea_id = ?", ideaId).
		Where("signup_time BETWEEN ? AND ?", from, to).
		Group("DATE(signup_time)").
		Order("date ASC")

	err := query.Scan(&results).Error
	if err != nil {
		return nil, err
	}

	return results, nil
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

func WithAudienceFiltered(fields []string, start, end *time.Time) QueryOption {
	return func(db *gorm.DB) *gorm.DB {
		preloadQuery := func(db *gorm.DB) *gorm.DB {
			if len(fields) > 0 {
				db = db.Select(fields)
			}

			if start != nil && end != nil {
				return db.Where("signup_time BETWEEN ? AND ?", *start, *end)
			} else if start != nil {
				return db.Where("signup_time >= ?", *start)
			} else if end != nil {
				return db.Where("signup_time <= ?", *end)
			}
			return db
		}

		return db.Preload("AudienceMembers", preloadQuery)
	}
}
