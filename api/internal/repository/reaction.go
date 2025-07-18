package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ReactionRepository interface {
	AddFeedbackReaction(ctx context.Context, reaction *domain.FeedbackReaction) error
	RemoveFeedbackReaction(ctx context.Context, fbId uuid.UUID, userId string) error
	AddIdeaReaction(ctx context.Context, reaction *domain.IdeaReaction) error
	RemoveIdeaReaction(ctx context.Context, ideaId uuid.UUID, userId string) error
	GetRecentIdeaReactionsForUser(ctx context.Context, userId string, limit int) ([]domain.IdeaReaction, error)
}

type reactionRepository struct {
	db *gorm.DB
}

func NewReactionRepo(db *gorm.DB) *reactionRepository {
	return &reactionRepository{db: db}
}

func (r *reactionRepository) AddFeedbackReaction(ctx context.Context, reaction *domain.FeedbackReaction) error {
	err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "feedback_id"}, {Name: "user_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"reaction_type": reaction.ReactionType,
			"updated_at":    time.Now(),
			"deleted_at":    nil,
		}),
	}).Create(reaction).Error
	if err != nil {
		fmt.Println("Error creating feedback reaction:", err)
		return err
	}

	return nil
}

func (r *reactionRepository) RemoveFeedbackReaction(ctx context.Context, fbId uuid.UUID, userId string) error {
	if err := r.db.WithContext(ctx).
		Where("feedback_id = ? AND user_id = ?", fbId, userId).
		Delete(&domain.FeedbackReaction{}).Error; err != nil {
		return err
	}

	return nil
}

func (r *reactionRepository) AddIdeaReaction(ctx context.Context, reaction *domain.IdeaReaction) error {
	err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "idea_id"}, {Name: "user_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"reaction_type": reaction.ReactionType,
			"updated_at":    time.Now(),
			"deleted_at":    nil,
		}),
	}).Create(reaction).Error
	if err != nil {
		fmt.Println("Error creating feedback reaction:", err)
		return err
	}

	return nil
}

func (r *reactionRepository) RemoveIdeaReaction(ctx context.Context, ideaId uuid.UUID, userId string) error {
	if err := r.db.WithContext(ctx).
		Where("idea_id = ? AND user_id = ?", ideaId, userId).
		Delete(&domain.IdeaReaction{}).Error; err != nil {
		return err
	}

	return nil
}

func (r *reactionRepository) GetRecentIdeaReactionsForUser(ctx context.Context, userId string, limit int) ([]domain.IdeaReaction, error) {
	var reactions []domain.IdeaReaction

	err := r.db.WithContext(ctx).
		Joins("JOIN ideas ON ideas.id = idea_reactions.idea_id").
		Where("ideas.user_id = ?", userId).
		Order("idea_reactions.created_at DESC").
		Limit(limit).
		Find(&reactions).Error

	if err != nil {
		fmt.Printf("Error fetching recent reactions by user ID %s: %v\n", userId, err)
		return nil, err
	}

	return reactions, nil

}
