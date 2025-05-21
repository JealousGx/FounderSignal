package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FeedbackRepository interface {
	Add(ctx context.Context, feedback *domain.Feedback) (*domain.Feedback, error)
	Update(ctx context.Context, feedbackId uuid.UUID, feedback *domain.Feedback) error
	GetById(ctx context.Context, feedbackId uuid.UUID) (*domain.Feedback, error)
	GetByIdea(ctx context.Context, ideaId uuid.UUID, queryParams *domain.QueryParams) ([]domain.Feedback, int64, error)
	GetForUser(ctx context.Context, userId string, limit int) ([]domain.Feedback, error)
	GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID) (int64, error)
	GetByIdeaWithTimeRange(ctx context.Context, ideaId uuid.UUID, startDate, endDate time.Time) ([]domain.Feedback, error)
	Delete(ctx context.Context, feedbackId uuid.UUID) error
}

type fbRepository struct {
	db *gorm.DB
}

func NewFeedbackRepo(db *gorm.DB) *fbRepository {
	return &fbRepository{db: db}
}

func (r *fbRepository) Add(ctx context.Context, feedback *domain.Feedback) (*domain.Feedback, error) {
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
		return nil, err
	}

	return feedback, nil
}

func (r *fbRepository) Update(ctx context.Context, feedbackId uuid.UUID, feedback *domain.Feedback) error {
	result := r.db.WithContext(ctx).Model(&domain.Feedback{}).
		Where("id = ?", feedbackId).
		Updates(feedback)

	if result.Error != nil {
		fmt.Printf("Error updating feedback %s: %v\n", feedbackId, result.Error)
		return result.Error
	}

	return nil
}

func (r *fbRepository) GetById(ctx context.Context, feedbackId uuid.UUID) (*domain.Feedback, error) {
	var feedback domain.Feedback

	err := r.db.WithContext(ctx).
		Where("id = ?", feedbackId).
		First(&feedback).Error
	if err != nil {
		fmt.Printf("Error fetching feedback %s: %v\n", feedbackId, err)
		return nil, err
	}

	return &feedback, nil
}

func (r *fbRepository) GetByIdea(ctx context.Context, ideaId uuid.UUID, queryParams *domain.QueryParams) ([]domain.Feedback, int64, error) {
	var feedbacks []domain.Feedback

	query := r.db.Model(&domain.Feedback{}).WithContext(ctx).
		Where("idea_id = ? AND parent_id IS NULL", ideaId)

	var totalComments int64
	err := query.Count(&totalComments).Error
	if err != nil {
		fmt.Printf("Error counting feedbacks for idea %s: %v\n", ideaId, err)
		return nil, 0, err
	}

	query = query.Preload("Reactions").
		Preload("Replies")

	isDescending := true // Default sort direction
	if queryParams.SortBy != "" && strings.HasSuffix(strings.ToLower(queryParams.SortBy), "asc") {
		isDescending = false
	}

	if isDescending {
		query = query.Order("created_at DESC, id DESC")
	} else {
		query = query.Order("created_at ASC, id ASC")
	}

	// Apply if LastCreatedAt and LastID are provided (i.e., not the first page)
	if !queryParams.LastCreatedAt.IsZero() && queryParams.LastId.String() != "" {
		if isDescending {
			query = query.Where(
				"(created_at < ?) OR (created_at = ? AND id < ?)",
				queryParams.LastCreatedAt, queryParams.LastCreatedAt, queryParams.LastId,
			)
		} else {
			query = query.Where(
				"(created_at > ?) OR (created_at = ? AND id > ?)",
				queryParams.LastCreatedAt, queryParams.LastCreatedAt, queryParams.LastId,
			)
		}
	}

	if queryParams.Limit > 0 {
		query = query.Limit(queryParams.Limit)
	}

	err = query.Find(&feedbacks).Error
	if err != nil {
		fmt.Println("Error fetching feedbacks:", err)
		return nil, 0, err
	}

	return feedbacks, totalComments, nil
}

func (r *fbRepository) GetForUser(ctx context.Context, userId string, limit int) ([]domain.Feedback, error) {
	var feedbacks []domain.Feedback

	err := r.db.WithContext(ctx).
		Joins("JOIN ideas ON ideas.id = feedbacks.idea_id").
		Where("ideas.user_id = ?", userId).
		Order("feedbacks.created_at DESC").
		Limit(limit).
		Preload("Reactions").
		Find(&feedbacks).Error

	if err != nil {
		fmt.Printf("Error fetching recent feedback by user ID %s: %v\n", userId, err)
		return nil, err
	}

	return feedbacks, nil
}

func (r *fbRepository) GetCountByIdeaId(ctx context.Context, ideaId uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&domain.Feedback{}).
		Where("idea_id = ?", ideaId).
		Count(&count).Error
	if err != nil {
		fmt.Printf("Error counting feedbacks for idea %s: %v\n", ideaId, err)
		return 0, err
	}

	return count, nil
}

func (r *fbRepository) GetByIdeaWithTimeRange(ctx context.Context, ideaId uuid.UUID, startDate, endDate time.Time) ([]domain.Feedback, error) {
	var feedbacks []domain.Feedback

	err := r.db.WithContext(ctx).
		Where("idea_id = ? AND created_at BETWEEN ? AND ?", ideaId, startDate, endDate).
		Find(&feedbacks).Error
	if err != nil {
		fmt.Printf("Error fetching feedbacks for idea %s: %v\n", ideaId, err)
		return nil, err
	}

	return feedbacks, nil
}

func (r *fbRepository) Delete(ctx context.Context, feedbackId uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("id = ? OR parent_id = ?", feedbackId, feedbackId).
		Delete(&domain.Feedback{}).Error
	if err != nil {
		fmt.Printf("Error deleting feedback %s: %v\n", feedbackId, err)
		return err
	}

	return nil
}
