package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MVPRepository interface {
	GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error)
	Update(ctx context.Context, mvp *domain.MVPSimulator) error
}

type mvpRepository struct {
	db *gorm.DB
}

func NewMVPRepo(db *gorm.DB) *mvpRepository {
	return &mvpRepository{db: db}
}

func (r *mvpRepository) GetByIdea(ctx context.Context, ideaId uuid.UUID) (*domain.MVPSimulator, error) {
	var mvp domain.MVPSimulator
	err := r.db.WithContext(ctx).Model(&domain.MVPSimulator{}).
		Where("idea_id = ?", ideaId).
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
