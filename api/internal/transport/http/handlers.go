package http

import (
	"foundersignal/internal/repository"
	"foundersignal/internal/service"

	"gorm.io/gorm"
)

type Handlers struct {
	Idea *IdeasHandler
}

func NewHandlers(
	db *gorm.DB,
) *Handlers {
	return &Handlers{
		Idea: getIdeasHandlers(db),
	}
}

func getIdeasHandlers(db *gorm.DB) *IdeasHandler {
	ideaRepo := repository.NewIdeasRepo(db)
	ideaService := service.NewIdeasService(ideaRepo)

	return NewIdeasHandler(ideaService)
}
