package service

import (
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"
)

type Services struct {
	Idea      IdeaService
	Feedback  FeedbackService
	Reaction  ReactionService
	MVP       MVPService
	Dashboard DashboardService
	Report    ReportService

	// Broadcaster for WebSocket events
	Broadcaster websocket.ActivityBroadcaster
}

func NewServices(repos *repository.Repositories, broadcaster websocket.ActivityBroadcaster) *Services {
	analyticsService := NewAnalyticsService(repos.Idea, repos.Signal, repos.Audience, repos.Feedback, repos.Report)

	return &Services{
		Idea:        NewIdeasService(repos.Idea, repos.Signal, repos.Audience),
		Feedback:    NewFeedbackService(repos.Feedback, repos.Idea, broadcaster),
		Reaction:    NewReactionService(repos.Reaction),
		MVP:         NewMVPService(repos.MVP, repos.Idea),
		Report:      NewReportService(repos.Report, repos.Idea, analyticsService),
		Dashboard:   NewDashboardService(repos.Idea, repos.MVP, repos.Feedback, repos.Signal, repos.Audience, repos.Reaction),
		Broadcaster: broadcaster,
	}
}
