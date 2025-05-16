package http

import (
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MVPHandler interface {
	GetByIdea(c *gin.Context)
	Update(c *gin.Context)
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

func (h *mvpHandler) Update(c *gin.Context) {
	var mvp request.UpdateMVP

	if err := c.ShouldBindJSON(&mvp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	ideaId := c.Param("ideaId")
	if ideaId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Idea ID is required"})
		return
	}

	err := h.service.Update(c.Request.Context(), uuid.MustParse(ideaId), userId.(string), mvp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Idea updated successfully"})
}
