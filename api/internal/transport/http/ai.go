package http

import (
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AIHandler interface {
	Generate(c *gin.Context)
}

type aiHandler struct {
	service service.AIService
}

func NewAIHandler(s service.AIService) *aiHandler {
	return &aiHandler{
		service: s,
	}
}

func (h *aiHandler) Generate(c *gin.Context) {
	var req request.AIGenerate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.service.Generate(c.Request.Context(), req.Prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate content from AI model"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": response})
}
