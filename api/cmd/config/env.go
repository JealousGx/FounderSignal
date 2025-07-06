package config

import (
	"foundersignal/internal/domain"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server domain.Server

	DB domain.DBConfig

	CLERK_JWKS_URL       string
	CLERK_WEBHOOK_SECRET string

	PADDLE_WEBHOOK_SECRET string

	PADDLE_STARTER_PLAN_ID  string
	PADDLE_PRO_PLAN_ID      string
	PADDLE_BUSINESS_PLAN_ID string

	GeminiAPIKey    string
	GeminiModelCode string

	DISCORD_WEBHOOK_URL string

	APP_ENV string
}

var Envs = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Server: domain.Server{
			Host: getEnv("HOST", "http://localhost"),
			Port: getEnv("PORT", "8080"),
		},

		DB: domain.DBConfig{User: getEnv("DBUser", "admin"),
			Pass: getEnv("DBPass", "admin"),
			SSL:  getEnv("DBSSL", "disable"),
			Name: getEnv("DBName", "postgres"),
			Host: getEnv("DBHost", "localhost"),
			Port: getEnv("DBPort", "5432"),
		},

		CLERK_JWKS_URL:       getEnv("CLERK_JWKS_URL", "https://clerk.YOUR_INSTANCE.clerk.accounts.dev/.well-known/jwks.json"),
		CLERK_WEBHOOK_SECRET: getEnv("CLERK_WEBHOOK_SECRET", "whsec_abcdefghijklmnopqrstuvwxyz"),

		PADDLE_WEBHOOK_SECRET: getEnv("PADDLE_WEBHOOK_SECRET", "abcd_abcd_abcd"),

		PADDLE_STARTER_PLAN_ID:  getEnv("PADDLE_STARTER_PLAN_ID", "pro_01jxsajk7xj3q08agx72evgfey"),
		PADDLE_PRO_PLAN_ID:      getEnv("PADDLE_PRO_PLAN_ID", "pro_01jxs1w0n3tax383gmf3ahb118"),
		PADDLE_BUSINESS_PLAN_ID: getEnv("PADDLE_BUSINESS_PLAN_ID", "pro_01jxs20dwtgtc0ywy6erm4gjxj"),

		GeminiAPIKey:    getEnv("GEMINI_API_KEY", "your-gemini-api-key"),
		GeminiModelCode: getEnv("GEMINI_MODEL_CODE", "gemini-1.5-flash"),

		DISCORD_WEBHOOK_URL: getEnv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),

		APP_ENV: getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
