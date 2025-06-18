package webhooks

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, w *Webhooks) {
	api := router.Group("/api/v1/webhooks")

	api.POST("/clerk", w.Clerk.Handler)
	api.POST("/paddle", w.Paddle.Handler)

}
