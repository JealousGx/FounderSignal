package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MVPRepository interface {
	Create(ctx context.Context, mvp *domain.MVPSimulator) (uuid.UUID, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.MVPSimulator, error)
	GetAllByIdea(ctx context.Context, ideaId uuid.UUID) ([]domain.MVPSimulator, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error)
	Update(ctx context.Context, mvp *domain.MVPSimulator) error
	Delete(ctx context.Context, id uuid.UUID) error
	SetActive(ctx context.Context, ideaId, mvpId uuid.UUID) error
	GetCountByIdea(ctx context.Context, ideaId uuid.UUID) (int64, error)
}

type mvpRepository struct {
	db *gorm.DB
}

func NewMVPRepo(db *gorm.DB) *mvpRepository {
	return &mvpRepository{db: db}
}

func (r *mvpRepository) Create(ctx context.Context, mvp *domain.MVPSimulator) (uuid.UUID, error) {
	if err := r.db.WithContext(ctx).Create(mvp).Error; err != nil {
		fmt.Println("Error creating mvp:", err)
		return uuid.Nil, err
	}

	return mvp.ID, nil
}

func (r *mvpRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.MVPSimulator, error) {
	var mvp domain.MVPSimulator
	err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).
		Where("id = ?", id).
		Preload("Idea").
		First(&mvp).Error
	if err != nil {
		fmt.Println("Error fetching MVP by ID:", err)
		return nil, err
	}

	return &mvp, nil
}

func (r *mvpRepository) GetAllByIdea(ctx context.Context, ideaId uuid.UUID) ([]domain.MVPSimulator, error) {
	var mvps []domain.MVPSimulator
	err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).
		Where("idea_id = ?", ideaId).
		Find(&mvps).Error
	if err != nil {
		fmt.Println("Error fetching all MVPs by idea ID:", err)
		return nil, err
	}

	return mvps, nil
}

func (r *mvpRepository) GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error) {
	var mvp domain.MVPSimulator
	err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).
		Where("idea_id = ? AND is_active = ?", ideaId, true).
		First(&mvp).Error
	if err != nil {
		fmt.Println("Error fetching MVP:", err)
		return nil, err
	}
	return &mvp, nil
}

func (r *mvpRepository) Update(ctx context.Context, mvp *domain.MVPSimulator) error {
	if err := r.db.WithContext(ctx).Model(mvp).Where("idea_id = ? ", mvp.IdeaID).Updates(mvp).Error; err != nil {
		fmt.Println("Error updating mvp:", err)

		return err
	}

	return nil
}

func (r *mvpRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).Where("id = ?", id).Delete(&domain.MVPSimulator{}).Error; err != nil {
		fmt.Println("Error deleting mvp:", err)
		return err
	}

	return nil
}

func (r *mvpRepository) SetActive(ctx context.Context, ideaId, mvpId uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&domain.MVPSimulator{}).
			Where("idea_id = ? AND is_active = ?", ideaId, true).
			Update("is_active", false).Error; err != nil {
			return err
		}

		if err := tx.Model(&domain.MVPSimulator{}).
			Where("id = ? AND idea_id = ?", mvpId, ideaId).
			Update("is_active", true).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *mvpRepository) GetCountByIdea(ctx context.Context, ideaId uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).
		Where("idea_id = ?", ideaId).
		Count(&count).Error
	if err != nil {
		fmt.Println("Error counting MVPs by idea ID:", err)
		return 0, err
	}

	return count, nil
}
