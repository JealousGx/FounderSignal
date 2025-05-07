package http

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, h *Handlers) {
	api := router.Group("/api/v1")

	// Idea routes
	ideasRouter := api.Group("/ideas")
	ideasRouter.POST("/", h.Idea.Create)
	ideasRouter.GET("/", h.Idea.GetAll)
	ideasRouter.GET("/:id", h.Idea.GetByID)
}
