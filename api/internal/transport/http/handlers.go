package http

import (
	"foundersignal/internal/service"
)

type Handlers struct {
	Idea *IdeaHandler
}

func NewHandlers(services *service.Services) *Handlers {
	return &Handlers{
		Idea: NewIdeaHandler(services.Idea),
	}
}
