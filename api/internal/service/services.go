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

	// Broadcaster for WebSocket events
	Broadcaster websocket.ActivityBroadcaster
}

func NewServices(repos *repository.Repositories, broadcaster websocket.ActivityBroadcaster) *Services {
	return &Services{
		Idea:        NewIdeasService(repos.Idea, repos.Signal, repos.Audience),
		Feedback:    NewFeedbackService(repos.Feedback, repos.Idea, broadcaster),
		Reaction:    NewReactionService(repos.Reaction),
		MVP:         NewMVPService(repos.MVP),
		Dashboard:   NewDashboardService(repos.Idea, repos.Feedback, repos.Signal, repos.Audience, repos.Reaction),
		Broadcaster: broadcaster,
	}
}
