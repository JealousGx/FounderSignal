package main

import (
	cfg "foundersignal/cmd/server/config"
	"foundersignal/internal/transport/http"
	"foundersignal/pkg/database"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := database.Connect(cfg.Envs.DB); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	db := database.GetDB()

	handlers := http.NewHandlers(db)

	http.RegisterRoutes(router, handlers)

	router.Run(":" + cfg.Envs.Server.Port)
}
