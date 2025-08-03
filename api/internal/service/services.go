package service

import (
	"foundersignal/internal/pkg/cloudflare"
	"foundersignal/internal/pkg/reddit"
	"foundersignal/internal/repository"
	"foundersignal/internal/websocket"

	"github.com/google/uuid"
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
	MVP                      MVPConfig
	Paddle                   PaddleServiceConfig
	Report                   ReportServiceConfig
	Idea                     IdeaServiceConfig
	CloudflareR2             cloudflare.R2Config
	SampleRedditValidationID uuid.UUID // ID for the sample Reddit validation
}

func NewServices(repos *repository.Repositories, broadcaster websocket.ActivityBroadcaster, aiService AIService, redditClient *reddit.RedditClient, cfg ServicesConfig) *Services {
	analyticsService := NewAnalyticsService(repos.Idea, repos.Signal, repos.Audience, repos.Feedback, repos.Report)
	r2Client := cloudflare.NewR2Bucket(cfg.CloudflareR2)

	return &Services{
		User:        NewUserService(repos.User, repos.Idea),
		Paddle:      NewPaddleService(repos.User, repos.Paddle, cfg.Paddle),
		Idea:        NewIdeasService(repos.Idea, repos.MVP, repos.User, repos.Signal, repos.Audience, aiService, cfg.Idea),
		Feedback:    NewFeedbackService(repos.Feedback, repos.Idea, broadcaster),
		Reaction:    NewReactionService(repos.Reaction),
		MVP:         NewMVPService(repos.MVP, repos.Idea, repos.User, aiService, r2Client, broadcaster, cfg.MVP),
		Report:      NewReportService(repos.Report, repos.Idea, repos.Feedback, repos.Activity, analyticsService, broadcaster, cfg.Report),
		Dashboard:   NewDashboardService(repos.Idea, repos.MVP, repos.Feedback, repos.Signal, repos.Audience, repos.Reaction, repos.Activity),
		Reddit:      NewRedditValidationService(repos.Reddit, repos.Idea, repos.User, redditClient, NewValidationAnalyzer(aiService), cfg.SampleRedditValidationID),
		Broadcaster: broadcaster,
		AI:          aiService,
	}
}
