package http

import (
	"foundersignal/internal/service"
)

type Handlers struct {
	Idea     IdeaHandler
	Feedback FeedbackHandler
	Reaction ReactionHandler
	MVP      MVPHandler
}

func NewHandlers(services *service.Services) *Handlers {
	return &Handlers{
		Idea:     NewIdeaHandler(services.Idea),
		Feedback: NewFeedbackHandler(services.Feedback),
		Reaction: NewReactionHandler(services.Reaction),
		MVP:      NewMVPHandler(services.MVP),
	}
}
