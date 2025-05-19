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
	Report   ReportRepository
}

func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		Idea:     NewIdeasRepo(db),
		Audience: NewAudienceRepo(db),
		Signal:   NewSignalRepo(db),
		Feedback: NewFeedbackRepo(db),
		Reaction: NewReactionRepo(db),
		MVP:      NewMVPRepo(db),
		Report:   NewReportRepository(db),
	}
}

type QueryOption func(*gorm.DB) *gorm.DB

func paginateAndOrder(query *gorm.DB, limit, offset int, order string) *gorm.DB {
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}
	if order != "" {
		query = query.Order(order)
	}
	return query
}
