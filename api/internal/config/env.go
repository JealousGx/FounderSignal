package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	// server
	Host string
	Port string

	// db
	DBUser string
	DBPass string
	DBSSL  string
	DBName string
	DBHost string
	DBPort string
}

var Envs = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Host: getEnv("HOST", "http://localhost"),
		Port: getEnv("PORT", "8080"),

		DBUser: getEnv("DBUser", "admin"),
		DBPass: getEnv("DBPass", "admin"),
		DBSSL:  getEnv("DBSSL", "disable"),
		DBName: getEnv("DBName", "postgres"),
		DBHost: getEnv("DBHost", "localhost"),
		DBPort: getEnv("DBPort", "5432"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}