package http

import (
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReactionHandler interface {
	FeedbackReaction(c *gin.Context)
	IdeaReaction(c *gin.Context)
}

type reactionHandler struct {
	service service.ReactionService
}

func NewReactionHandler(s service.ReactionService) *reactionHandler {
	return &reactionHandler{
		service: s,
	}
}

func (h *reactionHandler) FeedbackReaction(c *gin.Context) {
	fbId := c.Param("feedbackId")
	var parsedFbId *uuid.UUID = nil
	if fbId != "" {
		parsed, err := uuid.Parse(fbId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid feedback ID"})
			return
		}

		// Only set if it's not the zero UUID
		if parsed != uuid.Nil {
			parsedFbId = &parsed
		}
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

	reaction := &request.Reaction{}
	if err := c.ShouldBindJSON(&reaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.FeedbackReaction(c.Request.Context(), *parsedFbId, userIdStr, reaction.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reaction added successfully"})
}

func (h *reactionHandler) IdeaReaction(c *gin.Context) {
	ideaId := c.Param("ideaId")
	var parsedIdeaId *uuid.UUID = nil
	if ideaId != "" {
		parsed, err := uuid.Parse(ideaId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
			return
		}

		// Only set if it's not the zero UUID
		if parsed != uuid.Nil {
			parsedIdeaId = &parsed
		}
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

	reaction := &request.Reaction{}
	if err := c.ShouldBindJSON(&reaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.IdeaReaction(c.Request.Context(), *parsedIdeaId, userIdStr, reaction.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reaction added successfully"})
}
