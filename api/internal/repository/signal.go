package repository

import (
	"context"
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SignalRepository interface {
	GetByIdeaId(ctx context.Context, ideaId uuid.UUID, userId *string, eventType *domain.EventType) ([]*domain.Signal, error)
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID, eventType *domain.EventType, start, end *time.Time, fields []string) (int64, error)
}

type signalRepository struct {
	db *gorm.DB
}

func NewSignalRepo(db *gorm.DB) *signalRepository {
	return &signalRepository{db: db}
}

func (r *signalRepository) GetByIdeaId(ctx context.Context, ideaId uuid.UUID, userId *string, eventType *domain.EventType) ([]*domain.Signal, error) {
	var signals []*domain.Signal

	query := r.db.WithContext(ctx).Model(&domain.Signal{}).Where("idea_id = ?", ideaId)

	if userId != nil {
		query = query.Where("user_id = ?", *userId)
	}
	if eventType != nil {
		query = query.Where("event_type = ?", *eventType)
	}

	err := query.Find(&signals).Error
	if err != nil {
		return nil, err
	}

	return signals, nil
}

func (r *signalRepository) GetCountByIdeaId(
	ctx context.Context,
	ideaId uuid.UUID,
	eventType *domain.EventType,
	start, end *time.Time,
	fields []string,
) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&domain.Signal{}).
		Where("idea_id = ?", ideaId)

	if eventType != nil {
		query = query.Where("event_type = ?", *eventType)
	}

	if start != nil && end != nil {
		query = query.Where("created_at BETWEEN ? AND ?", *start, *end)
	} else if start != nil {
		query = query.Where("created_at >= ?", *start)
	} else if end != nil {
		query = query.Where("created_at <= ?", *end)
	}

	if len(fields) > 0 {
		query = query.Select(fields)
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func WithSignalFiltered(fields []string, eventType *domain.EventType, start, end *time.Time) QueryOption {
	return func(db *gorm.DB) *gorm.DB {
		preloadQuery := func(db *gorm.DB) *gorm.DB {
			if len(fields) > 0 {
				db = db.Select(fields)
			}

			if eventType != nil {
				db = db.Where("event_type = ?", *eventType)
			}

			// Apply date range filtering
			if start != nil && end != nil {
				return db.Where("created_at BETWEEN ? AND ?", *start, *end)
			} else if start != nil {
				return db.Where("created_at >= ?", *start)
			} else if end != nil {
				return db.Where("created_at <= ?", *end)
			}
			return db
		}

		return db.Preload("Signals", preloadQuery)
	}
}

func WithSignalCountUntilDate(eventType domain.EventType, date *time.Time) QueryOption {
	return func(db *gorm.DB) *gorm.DB {
		countExpr := "COALESCE(SUM(CASE WHEN signals.event_type = ? THEN 1 ELSE 0 END), 0) AS views"

		query := db.Model(&domain.Signal{}).
			Select("ideas.*, "+countExpr, eventType).
			Joins("LEFT JOIN signals ON signals.idea_id = ideas.id")

		if date != nil {
			query = query.Where("signals.created_at <= ?", *date)
		}

		return query.Group("ideas.id")
	}
}
