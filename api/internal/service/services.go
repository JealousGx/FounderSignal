package service

import "foundersignal/internal/repository"

type Services struct {
	Idea IdeaService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		Idea: NewIdeasService(repos.Idea),
	}
}
