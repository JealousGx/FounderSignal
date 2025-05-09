package http

import (
	"foundersignal/cmd/config"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, h *Handlers, envs config.Config) {
	api := router.Group("/api/v1")

	authMiddleware := NewClerkAuth(envs.CLERK_JWKS_URL)

	protectedRouter := api.Group("/dashboard")
	protectedRouter.Use(authMiddleware.Middleware())

	registerPublicRoutes(api, h)
	registerProtectedRoutes(protectedRouter, h)
}

func registerProtectedRoutes(router *gin.RouterGroup, h *Handlers) {
	// ideas routes
	ideasRouter := router.Group("/ideas")
	ideasRouter.POST("/", h.Idea.Create)
}

func registerPublicRoutes(router *gin.RouterGroup, h *Handlers) {
	// ideas routes
	ideasRouter := router.Group("/ideas")
	ideasRouter.GET("/", h.Idea.GetAll)
	ideasRouter.GET("/:id", h.Idea.GetByID)
}
