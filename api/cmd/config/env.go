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

		APP_ENV: getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
