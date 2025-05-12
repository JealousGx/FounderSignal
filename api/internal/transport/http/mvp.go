package http

import (
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MVPHandler interface {
	GetByIdea(c *gin.Context)
}

type mvpHandler struct {
	service service.MVPService
}

func NewMVPHandler(s service.MVPService) *mvpHandler {
	return &mvpHandler{
		service: s,
	}
}

func (h *mvpHandler) GetByIdea(c *gin.Context) {
	ideaId := c.Param("ideaId")
	if ideaId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Idea ID is required"})
		return
	}

	parsedIdeaId, err := uuid.Parse(ideaId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
		return
	}

	mvp, err := h.service.GetByIdea(c.Request.Context(), parsedIdeaId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mvp)
}
