package database

import (
	"fmt"
	"foundersignal/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes the database connection
func Connect(dbConfig domain.DBConfig) error {
	// dsn = "host=localhost user=postgres password=postgres dbname=foundersignal port=5432 sslmode=disable"
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=%s", dbConfig.Host, dbConfig.User, dbConfig.Pass, dbConfig.Name, dbConfig.SSL)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: &QueryLogger{logger.Default.LogMode(logger.Info)},
	})
	if err != nil {
		return err
	}

	// Auto-migrate models / domains
	err = DB.AutoMigrate(
		&domain.User{},
		&domain.Idea{},
		&domain.MVPSimulator{},
		&domain.Signal{},
		&domain.Feedback{},
		&domain.FeedbackReaction{},
		&domain.IdeaReaction{},
		&domain.AudienceMember{},
		&domain.Report{},
	)

	return err
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
	return DB
}
