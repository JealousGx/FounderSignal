package main

import (
	cfg "foundersignal/cmd/config"
	"foundersignal/internal/pkg/auth"
	"foundersignal/internal/repository"
	"foundersignal/internal/service"
	"foundersignal/internal/transport/http"
	ws "foundersignal/internal/websocket"
	"foundersignal/pkg/database"
	"log"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := database.Connect(cfg.Envs.DB); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	http.InitializeLogger(cfg.Envs.APP_ENV)
	defer http.GetLogger().Sync()

	router := gin.Default()
	router.Use(http.CORS(), http.ErrorHandler(), http.Logger(), gzip.Gzip(gzip.BestCompression))

	// Initialize WebSocket Hub and run it in a goroutine
	websocketHub := ws.NewHub()
	go websocketHub.Run()

	// Initialize Broadcaster
	activityBroadcaster := ws.NewHubBroadcaster(websocketHub)

	// Initialize Token Authenticator for WebSockets
	tokenAuthForWS := auth.NewClerkTokenAuthenticator(cfg.Envs.CLERK_JWKS_URL)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Setup WebSocket Route
	router.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(websocketHub, tokenAuthForWS, c.Writer, c.Request)
	})

	db := database.GetDB()

	repos := repository.NewRepositories(db)
	services := service.NewServices(repos, activityBroadcaster)
	handlers := http.NewHandlers(services)

	http.RegisterRoutes(router, handlers, cfg.Envs)

	router.Run(":" + cfg.Envs.Server.Port)
}
