package service

import "foundersignal/internal/repository"

type Services struct {
	Idea      IdeaService
	Feedback  FeedbackService
	Reaction  ReactionService
	MVP       MVPService
	Dashboard DashboardService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		Idea:      NewIdeasService(repos.Idea, repos.Signal, repos.Audience),
		Feedback:  NewFeedbackService(repos.Feedback),
		Reaction:  NewReactionService(repos.Reaction),
		MVP:       NewMVPService(repos.MVP),
		Dashboard: NewDashboardService(repos.Idea, repos.Signal, repos.Audience),
	}
}
