package config

import (
	"foundersignal/internal/domain"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server domain.Server

	DB domain.DBConfig
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
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}