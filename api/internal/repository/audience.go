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
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID, start, end *time.Time) (int64, error)
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
	start, end time.Time,
) ([]int64, error) {
	var results []int64

	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Select("DATE(created_at) as date, COUNT(*) as signups").
		Where("idea_id = ?", ideaId).
		Where("created_at BETWEEN ? AND ?", start, end).
		Group("DATE(created_at)").
		Order("date ASC")

	err := query.Scan(&results).Error
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *audienceRepository) GetCountByIdeaId(
	ctx context.Context,
	ideaId uuid.UUID,
	start, end *time.Time,
) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&domain.AudienceMember{}).
		Where("idea_id = ?", ideaId)

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

func WithAudienceFiltered(fields []string, start, end *time.Time) QueryOption {
	return func(db *gorm.DB) *gorm.DB {
		preloadQuery := func(db *gorm.DB) *gorm.DB {
			if len(fields) > 0 {
				db = db.Select(fields)
			}

			if start != nil && end != nil {
				return db.Where("created_at BETWEEN ? AND ?", *start, *end)
			} else if start != nil {
				return db.Where("created_at >= ?", *start)
			} else if end != nil {
				return db.Where("created_at <= ?", *end)
			}
			return db
		}

		return db.Preload("AudienceMembers", preloadQuery)
	}
}
