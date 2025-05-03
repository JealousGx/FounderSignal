package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type IdeaRequest struct {
  Title string `json:"title" binding:"required"`
  CTA   string `json:"cta" binding:"required"`
}

func CreateIdea(c *gin.Context) {
  var req IdeaRequest
  if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }
  
  // Temporary in-memory storage
  c.JSON(http.StatusOK, gin.H{
    "id":    "mock123",
    "title": req.Title,
    "cta":   req.CTA,
  })
}

func ListIdeas(c *gin.Context) {
  c.JSON(http.StatusOK, gin.H{
    "ideas": []map[string]string{
      {"id": "1", "title": "AI Resume Writer", "cta": "Join beta"},
      {"id": "2", "title": "NFT Rental Market", "cta": "Get early access"},
    },
  });
}