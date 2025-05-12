package http

import (
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SignalHandler interface {
	RecordSignal(c *gin.Context)
}

type signalHandler struct {
	ideaService service.IdeaService
}

func NewSignalHandler(s service.IdeaService) *signalHandler {
	return &signalHandler{ideaService: s}
}

func (h *signalHandler) RecordSignal(c *gin.Context) {
	ideaIDStr := c.Param("ideaId")
	ideaID, err := uuid.Parse(ideaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID format"})
		return
	}

	var req request.RecordSignalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userId string
	if id, ok := c.Get("userId"); ok {
		userId = id.(string)
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	err = h.ideaService.RecordSignal(c.Request.Context(), ideaID, userId, req.EventType, ipAddress, userAgent, req.Metadata)
	if err != nil {
		log.Printf("Error recording signal for idea %s: %v", ideaIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record signal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Signal recorded"})
}
