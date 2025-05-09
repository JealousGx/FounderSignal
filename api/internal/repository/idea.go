package repository

import (
	"context"
	"foundersignal/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IdeaRepository interface {
	CreateWithMVP(ctx context.Context, idea *domain.Idea, mvp *domain.MVPSimulator) (uuid.UUID, error)
	GetAll(ctx context.Context, isDashboard bool) ([]*domain.Idea, error)
	GetWithMVP(ctx context.Context, id uuid.UUID) (*domain.Idea, error)
	UpdateMVP(ctx context.Context, mvpId uuid.UUID, mvp *domain.MVPSimulator) error

	// utils
	VerifyIdeaOwner(ctx context.Context, ideaID uuid.UUID, userID string) (bool, error)
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

func (r *ideaRepository) GetAll(ctx context.Context, isDashboard bool) ([]*domain.Idea, error) {
	var ideas []*domain.Idea
	query := r.db.WithContext(ctx).Model(&domain.Idea{})

	if isDashboard {
		query = query.Preload("MVPSimulator").Preload("Signals").Preload("Feedback")
	}

	if err := query.Find(&ideas).Error; err != nil {
		return nil, err
	}

	return ideas, nil
}

func (r *ideaRepository) GetWithMVP(ctx context.Context, id uuid.UUID) (*domain.Idea, error) {
	var idea domain.Idea
	err := r.db.WithContext(ctx).
		Preload("MVPSimulator").
		First(&idea, "id = ?", id).Error

	return &idea, err
}

func (r *ideaRepository) UpdateMVP(ctx context.Context, mvpId uuid.UUID, mvp *domain.MVPSimulator) error {
	return r.db.WithContext(ctx).
		Model(&domain.MVPSimulator{}).
		Where("id = ?", mvpId).
		Updates(mvp).Error
}

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
