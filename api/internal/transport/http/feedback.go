package http

import (
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FeedbackHandler interface {
	Create(c *gin.Context)
	GetByIdea(c *gin.Context)
}

type fbHandler struct {
	service service.FeedbackService
}

func NewFeedbackHandler(s service.FeedbackService) *fbHandler {
	return &fbHandler{
		service: s,
	}
}

func (h *fbHandler) Create(c *gin.Context) {
	var fb request.CreateFeedback

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

	parentId := c.Param("feedbackId")
	var parsedParentId *uuid.UUID = nil
	if parentId != "" {
		parsed, err := uuid.Parse(parentId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent feedback ID"})
			return
		}

		// Only set if it's not the zero UUID
		if parsed != uuid.Nil {
			parsedParentId = &parsed
		}
	}

	if err := c.ShouldBindJSON(&fb); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	createdFBId, err := h.service.Add(c.Request.Context(), parsedIdeaId, parsedParentId, userIdStr, &fb)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": createdFBId})
}

func (h *fbHandler) GetByIdea(c *gin.Context) {
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

	userId, exists := c.Get("userId")
	var userIdStr *string = nil
	if exists {
		userIdStrVal, ok := userId.(string)
		if ok {
			userIdStr = &userIdStrVal
		}
	}

	feedbacks, err := h.service.GetByIdea(c.Request.Context(), parsedIdeaId, userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": feedbacks})
}
