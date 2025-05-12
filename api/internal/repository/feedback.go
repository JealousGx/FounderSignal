package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FeedbackRepository interface {
	Add(ctx context.Context, feedback *domain.Feedback) (uuid.UUID, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID) ([]domain.Feedback, error)
}

type fbRepository struct {
	db *gorm.DB
}

func NewFeedbackRepo(db *gorm.DB) *fbRepository {
	return &fbRepository{db: db}
}

func (r *fbRepository) Add(ctx context.Context, feedback *domain.Feedback) (uuid.UUID, error) {
	// if the feedback.ParentId exists and the parent has its own parent.
	// avoid deep nesting of feedbacks
	// set the feedback.ParentId to the top level parent

	if feedback.ParentID != nil && *feedback.ParentID != uuid.Nil {
		var parentFeedback domain.Feedback
		err := r.db.Model(&domain.Feedback{}).WithContext(ctx).
			Where("id = ?", *feedback.ParentID).
			First(&parentFeedback).Error
		if err != nil {
			fmt.Println("feedback parent not found. is new feedback")
		}

		if parentFeedback.ParentID != nil && *parentFeedback.ParentID != uuid.Nil {
			feedback.ParentID = parentFeedback.ParentID
		}
	}

	if err := r.db.Model(&domain.Feedback{}).WithContext(ctx).Create(feedback).Error; err != nil {
		return uuid.Nil, err
	}

	return feedback.ID, nil
}

func (r *fbRepository) GetByIdea(ctx context.Context, ideaId uuid.UUID) ([]domain.Feedback, error) {
	var feedbacks []domain.Feedback

	if err := r.db.Model(&domain.Feedback{}).WithContext(ctx).
		Where("idea_id = ?", ideaId).
		Preload("Reactions").
		Find(&feedbacks).Error; err != nil {
		fmt.Println("Error fetching feedbacks:", err)
		return nil, err
	}

	return feedbacks, nil
}
