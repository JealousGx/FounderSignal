package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SignalRepository interface {
	Create(ctx context.Context, signal *domain.Signal) error
	GetDailyViewsByIdeaIDs(ctx context.Context, ideaIds []uuid.UUID, from, to time.Time) (map[uuid.UUID]map[string]int, error)
	GetRecentByUserIdeas(ctx context.Context, userId string, limit int) ([]domain.Signal, error)
	GetByIdeaId(ctx context.Context, ideaId uuid.UUID, userId *string, eventType *domain.EventType) ([]*domain.Signal, error)
	GetCountForIdeaOwner(ctx context.Context, ideaOwnerId string, specs SignalQuerySpecs) (int64, error)
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID, eventType *domain.EventType, start, end *time.Time, fields []string) (int64, error)
	GetByIdeaWithTimeRange(ctx context.Context, ideaId uuid.UUID, startDate, endDate time.Time) ([]domain.Signal, error)
}

type signalRepository struct {
	db *gorm.DB
}

type SignalQuerySpecs struct {
	EventType domain.EventType
	Start     *time.Time
	End       *time.Time
}

func NewSignalRepo(db *gorm.DB) *signalRepository {
	return &signalRepository{db: db}
}

func (r *signalRepository) Create(ctx context.Context, signal *domain.Signal) error {
	return r.db.WithContext(ctx).Create(signal).Error
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

// GetDailyViewsByIdeaIDs gets daily view counts for a set of ideas
func (r *signalRepository) GetDailyViewsByIdeaIDs(ctx context.Context, ideaIds []uuid.UUID, from, to time.Time) (map[uuid.UUID]map[string]int, error) {
	type DailyViewPerIdea struct {
		IdeaID uuid.UUID `gorm:"column:idea_id"`
		Date   string    `gorm:"column:date"`
		Count  int       `gorm:"column:count"`
	}

	var results []DailyViewPerIdea

	if len(ideaIds) == 0 {
		return make(map[uuid.UUID]map[string]int), nil
	}

	query := r.db.WithContext(ctx).
		Model(&domain.Signal{}).
		Select("idea_id, DATE(created_at) as date, COUNT(*) as count").
		Where("idea_id IN (?) AND event_type = ? AND created_at BETWEEN ? AND ?",
			ideaIds, domain.EventTypePageView, from, to).
		Group("idea_id, DATE(created_at)")

	if err := query.Find(&results).Error; err != nil {
		fmt.Println("Error executing query:", err)
		return nil, err
	}

	dailyViewsByIdea := make(map[uuid.UUID]map[string]int)
	for _, result := range results {
		if _, ok := dailyViewsByIdea[result.IdeaID]; !ok {
			dailyViewsByIdea[result.IdeaID] = make(map[string]int)
		}
		dailyViewsByIdea[result.IdeaID][result.Date] = result.Count
	}

	return dailyViewsByIdea, nil
}

// GetRecentByUserIdeas gets recent signals for all ideas of a user
func (r *signalRepository) GetRecentByUserIdeas(ctx context.Context, userId string, limit int) ([]domain.Signal, error) {
	var signals []domain.Signal

	query := r.db.WithContext(ctx).
		Joins("JOIN ideas ON signals.idea_id = ideas.id").
		Where("ideas.user_id = ?", userId).
		Order("signals.created_at DESC").
		Limit(limit)

	if err := query.Find(&signals).Error; err != nil {
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

func (r *signalRepository) GetCountForIdeaOwner(ctx context.Context, ideaOwnerId string, specs SignalQuerySpecs) (int64, error) {
	if specs.EventType == "" {
		specs.EventType = domain.EventTypePageView
	}

	query := r.db.WithContext(ctx).
		Model(&domain.Signal{}).
		Joins("JOIN ideas ON ideas.id = signals.idea_id").
		Where("ideas.user_id = ?", ideaOwnerId).
		Where("signals.event_type = ?", specs.EventType)

	if specs.Start != nil && specs.End != nil {
		query = query.Where("signals.created_at BETWEEN ? AND ?", *specs.Start, *specs.End)
	} else if specs.Start != nil {
		query = query.Where("signals.created_at >= ?", *specs.Start)
	} else if specs.End != nil {
		query = query.Where("signals.created_at <= ?", *specs.End)
	}

	var count int64
	err := query.Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *signalRepository) GetByIdeaWithTimeRange(ctx context.Context, ideaId uuid.UUID, startDate, endDate time.Time) ([]domain.Signal, error) {
	var signals []domain.Signal

	err := r.db.WithContext(ctx).
		Where("idea_id = ? AND created_at BETWEEN ? AND ?", ideaId, startDate, endDate).
		Order("signals.created_at ASC").
		Find(&signals).Error
	if err != nil {
		fmt.Printf("Error fetching signals for idea %s: %v\n", ideaId, err)
		return nil, err
	}

	return signals, nil
}
