package main

import (
	"context"
	cfg "foundersignal/cmd/config"
	"foundersignal/internal/pkg/ai"
	"foundersignal/internal/pkg/auth"
	"foundersignal/internal/pkg/reddit"
	"foundersignal/internal/repository"
	"foundersignal/internal/service"
	"foundersignal/internal/transport/http"
	wh "foundersignal/internal/transport/webhooks"
	ws "foundersignal/internal/websocket"
	"foundersignal/pkg/database"
	rate_limiter "foundersignal/pkg/rate-limiter"
	"log"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func main() {
	if err := database.Connect(cfg.Envs.DB); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	http.InitializeLogger(cfg.Envs.APP_ENV)
	defer http.GetLogger().Sync()

	router := gin.Default()
	router.SetTrustedProxies(nil)
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

	servicesCfg := service.ServicesConfig{
		Paddle: service.PaddleServiceConfig{
			StarterPlanID:  cfg.Envs.PADDLE_STARTER_PLAN_ID,
			ProPlanID:      cfg.Envs.PADDLE_PRO_PLAN_ID,
			BusinessPlanID: cfg.Envs.PADDLE_BUSINESS_PLAN_ID,
		},
		Report: service.ReportServiceConfig{
			DiscordWebhookURL: cfg.Envs.DISCORD_WEBHOOK_URL,
			Environment:       cfg.Envs.APP_ENV,
		},
	}

	db := database.GetDB()

	aiGenerator, err := ai.NewAIGenerator(context.Background(), ai.AIConfig{GeminiAPIKey: cfg.Envs.GeminiAPIKey, GeminiModelCode: cfg.Envs.GeminiModelCode, GeminiEmbeddingModelCode: cfg.Envs.GeminiEmbeddingModelCode})
	if err != nil {
		log.Fatalf("Failed to initialize AI generator: %v", err)
	}
	aiService := service.NewAIService(aiGenerator)

	redditClient := reddit.NewClient()

	repos := repository.NewRepositories(db)
	services := service.NewServices(repos, activityBroadcaster, aiService, redditClient, servicesCfg)
	handlers := http.NewHandlers(services)
	webhooks := wh.NewWebhooks(services, wh.Secrets{
		ClerkWebhookSecret:  cfg.Envs.CLERK_WEBHOOK_SECRET,
		PaddleWebhookSecret: cfg.Envs.PADDLE_WEBHOOK_SECRET,
	})

	wh.RegisterRoutes(router, webhooks)

	apiGroup := router.Group("/")

	limiter := rate_limiter.NewIPRateLimiter(rate.Limit(cfg.Envs.RATE_LIMITER_RATE), cfg.Envs.RATE_LIMITER_BURST)
	apiGroup.Use(limiter.Middleware())
	{
		// Setup WebSocket Route
		apiGroup.GET("/ws", func(c *gin.Context) {
			ws.ServeWs(websocketHub, tokenAuthForWS, c.Writer, c.Request)
		})

		http.RegisterRoutes(apiGroup, handlers, cfg.Envs)
	}

	router.Run(":" + cfg.Envs.Server.Port)
}
