package main

import (
	cfg "foundersignal/cmd/config"
	"foundersignal/internal/repository"
	"foundersignal/internal/service"
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
	router.Use(http.CORS(), http.ErrorHandler(), http.Logger())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	db := database.GetDB()

	repos := repository.NewRepositories(db)
	services := service.NewServices(repos)
	handlers := http.NewHandlers(services)

	http.RegisterRoutes(router, handlers, cfg.Envs)

	router.Run(":" + cfg.Envs.Server.Port)
}
