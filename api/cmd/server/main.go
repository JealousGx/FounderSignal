package main

import (
	ideas "foundersignal/internal/handlers/ideas"
	"foundersignal/pkg/database"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
  if err := database.Connect(); err != nil {
    log.Fatalf("Failed to connect to database: %v", err)
  }

  router := gin.Default()
  router.GET("/health", func(c *gin.Context) {
    c.JSON(200, gin.H{
      "status": "ok",
    })
  });
  router.GET("/ideas", ideas.GetIdeas)

  router.Run(":8080")
}
