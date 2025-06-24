package main

import (
	"context"
	cfg "foundersignal/cmd/config"
	"foundersignal/internal/pkg/ai"
	"foundersignal/internal/pkg/auth"
	"foundersignal/internal/repository"
	"foundersignal/internal/service"
	"foundersignal/internal/transport/http"
	wh "foundersignal/internal/transport/webhooks"
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

	aiGenerator, err := ai.NewAIGenerator(context.Background(), ai.AIConfig{GeminiAPIKey: cfg.Envs.GeminiAPIKey, GeminiModelCode: cfg.Envs.GeminiModelCode})
	if err != nil {
		log.Fatalf("Failed to initialize AI generator: %v", err)
	}
	aiService := service.NewAIService(aiGenerator)

	repos := repository.NewRepositories(db)
	services := service.NewServices(repos, activityBroadcaster, aiService)
	handlers := http.NewHandlers(services)
	webhooks := wh.NewWebhooks(services, wh.Secrets{
		ClerkWebhookSecret:  cfg.Envs.CLERK_WEBHOOK_SECRET,
		PaddleWebhookSecret: cfg.Envs.PADDLE_WEBHOOK_SECRET,
	})

	http.RegisterRoutes(router, handlers, cfg.Envs)
	wh.RegisterRoutes(router, webhooks)

	router.Run(":" + cfg.Envs.Server.Port)
}
