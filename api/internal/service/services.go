package service

import (
	"foundersignal/internal/pkg/reddit"
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"
)

type Services struct {
	User      UserService
	Idea      IdeaService
	Feedback  FeedbackService
	Reaction  ReactionService
	MVP       MVPService
	Dashboard DashboardService
	Report    ReportService
	Paddle    PaddleService
	AI        AIService
	Reddit    RedditValidationService

	// Broadcaster for WebSocket events
	Broadcaster websocket.ActivityBroadcaster
}

type ServicesConfig struct {
	Paddle PaddleServiceConfig
	Report ReportServiceConfig
}

func NewServices(repos *repository.Repositories, broadcaster websocket.ActivityBroadcaster, aiService AIService, redditClient *reddit.RedditClient, cfg ServicesConfig) *Services {
	analyticsService := NewAnalyticsService(repos.Idea, repos.Signal, repos.Audience, repos.Feedback, repos.Report)

	return &Services{
		User:        NewUserService(repos.User, repos.Idea),
		Paddle:      NewPaddleService(repos.User, repos.Paddle, cfg.Paddle),
		Idea:        NewIdeasService(repos.Idea, repos.MVP, repos.User, repos.Signal, repos.Audience, aiService),
		Feedback:    NewFeedbackService(repos.Feedback, repos.Idea, broadcaster),
		Reaction:    NewReactionService(repos.Reaction),
		MVP:         NewMVPService(repos.MVP, repos.Idea, repos.User, aiService),
		Report:      NewReportService(repos.Report, repos.Idea, analyticsService, cfg.Report),
		Dashboard:   NewDashboardService(repos.Idea, repos.MVP, repos.Feedback, repos.Signal, repos.Audience, repos.Reaction),
		Reddit:      NewRedditValidationService(repos.Reddit, repos.Idea, repos.User, redditClient, NewValidationAnalyzer(aiService)),
		Broadcaster: broadcaster,
		AI:          aiService,
	}
}
