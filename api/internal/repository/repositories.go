package repository

import (
	"gorm.io/gorm"
)

type Repositories struct {
	Idea     IdeaRepository
	Audience AudienceRepository
	Signal   SignalRepository
	Feedback FeedbackRepository
	Reaction ReactionRepository
	MVP      MVPRepository
}

func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		Idea:     NewIdeasRepo(db),
		Audience: NewAudienceRepo(db),
		Signal:   NewSignalRepo(db),
		Feedback: NewFeedbackRepo(db),
		Reaction: NewReactionRepo(db),
		MVP:      NewMVPRepo(db),
	}
}

type QueryOption func(*gorm.DB) *gorm.DB

func selectFields(fields []string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Select(fields)
	}
}
