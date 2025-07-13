package http

import (
	"encoding/json"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RedditValidationHandler interface {
	GenerateValidation(c *gin.Context)
	GetValidation(c *gin.Context)
	GetValidationsForUser(c *gin.Context)
	GetSampleValidation(c *gin.Context)
}

type redditValidationHandler struct {
	service service.RedditValidationService
}

func NewRedditValidationHandler(s service.RedditValidationService) *redditValidationHandler {
	return &redditValidationHandler{
		service: s,
	}
}

func (h *redditValidationHandler) GenerateValidation(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req struct {
		IdeaID string `json:"ideaId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ideaID, err := uuid.Parse(req.IdeaID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Idea ID"})
		return
	}

	validationID, err := h.service.GenerateValidation(c.Request.Context(), userID.(string), ideaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"validationId": validationID})
}

func (h *redditValidationHandler) GetValidation(c *gin.Context) {
	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	validationIDStr := c.Param("validationId")
	validationID, err := uuid.Parse(validationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid validation ID"})
		return
	}

	validation, err := h.service.GetValidation(c.Request.Context(), validationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, validation)
}

func (h *redditValidationHandler) GetValidationsForUser(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	queryParams := getProcessedQueryParams(c)
	validations, err := h.service.GetValidationsForUser(c.Request.Context(), userID.(string), queryParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, validations)
}

func (h *redditValidationHandler) GetSampleValidation(c *gin.Context) {

	validation := h.service.GetSampleValidation(c.Request.Context())
	if jsonBytes, err := json.MarshalIndent(validation, "", "  "); err == nil {
		println(string(jsonBytes))
	}

	if validation == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sample validation not found"})
		return
	}

	c.JSON(http.StatusOK, validation)
}
