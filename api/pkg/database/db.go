package database

import (
	"fmt"
	"foundersignal/internal/config"
	"foundersignal/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect initializes the database connection
func Connect() error {
        // dsn = "host=localhost user=postgres password=postgres dbname=foundersignal port=5432 sslmode=disable"
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=%s", config.Envs.DBHost, config.Envs.DBUser, config.Envs.DBPass, config.Envs.DBName, config.Envs.DBSSL)
    
    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return err
    }
    
    // Auto-migrate models
    err = DB.AutoMigrate(
        &models.Idea{},
        &models.MVPSimulator{},
        &models.Signal{},
        &models.Feedback{},
        &models.FeedbackReaction{},
        &models.AudienceMember{},
        &models.Report{},
    )
    
    return err
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
    return DB
}