package http

import (
	"foundersignal/cmd/config"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, h *Handlers, envs config.Config) {
	api := router.Group("/api/v1")

	authMiddleware := NewClerkAuth(envs.CLERK_JWKS_URL)
	api.Use(authMiddleware.Middleware())

	protectedRouter := api.Group("/dashboard")

	registerPublicRoutes(api, h)
	registerProtectedRoutes(protectedRouter, h)
}

func registerProtectedRoutes(router *gin.RouterGroup, h *Handlers) {
	// ideas routes
	ideasRouter := router.Group("/ideas")
	ideasRouter.POST("/", h.Idea.Create)
	ideasRouter.PUT("/:ideaId", h.Idea.Update)
	ideasRouter.DELETE("/:ideaId", h.Idea.Delete)
	ideasRouter.PUT("/:ideaId/mvp", h.MVP.Update)

	ideasRouter.POST("/:ideaId/feedback", h.Feedback.Create)
	ideasRouter.POST("/:ideaId/feedback/:feedbackId", h.Feedback.Create)
	ideasRouter.PUT("/:ideaId/feedback/:feedbackId/reaction", h.Reaction.FeedbackReaction)
	ideasRouter.PUT("/:ideaId/reaction", h.Reaction.IdeaReaction)

	ideasRouter.GET("/user", h.Idea.GetUserIdeas)
	ideasRouter.GET("/user/:ideaId", h.Dashboard.GetIdea)

	router.GET("/", h.Dashboard.GetDashboardData)
	router.GET("/recent-activity", h.Dashboard.GetRecentActivity)

	router.GET("/audience", h.Dashboard.GetAudience)

	router.GET("/reports", h.Report.GetReportsList)
	router.GET("/reports/:reportId", h.Report.GetByID)
	router.POST("/reports/generate", h.Report.GenerateReport)

	router.PUT("/feedback/:feedbackId", h.Feedback.Update)
	router.DELETE("/feedback/:feedbackId", h.Feedback.Delete)
}

func registerPublicRoutes(router *gin.RouterGroup, h *Handlers) {
	// ideas routes
	ideasRouter := router.Group("/ideas")
	ideasRouter.GET("/", h.Idea.GetIdeas)
	ideasRouter.GET("/:ideaId", h.Idea.GetByID)
	ideasRouter.GET("/:ideaId/feedback", h.Feedback.GetByIdea)
	ideasRouter.GET("/:ideaId/mvp", h.MVP.GetByIdea)
	ideasRouter.POST("/:ideaId/signals", h.Signal.RecordSignal)

}
