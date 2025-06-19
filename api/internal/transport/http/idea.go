package http

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IdeaHandler interface {
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	GetIdeas(c *gin.Context)
	GetByID(c *gin.Context)
	GetUserIdeas(c *gin.Context)
}

type ideaHandler struct {
	service service.IdeaService
}

func NewIdeaHandler(s service.IdeaService) *ideaHandler {
	return &ideaHandler{
		service: s,
	}
}

func (h *ideaHandler) Create(c *gin.Context) {
	var idea request.CreateIdea

	if err := c.ShouldBindJSON(&idea); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	createdIdeaId, err := h.service.Create(c.Request.Context(), userId.(string), &idea)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": createdIdeaId})
}

func (h *ideaHandler) Update(c *gin.Context) {
	var idea request.UpdateIdea

	if err := c.ShouldBindJSON(&idea); err != nil {
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

	err := h.service.Update(c.Request.Context(), userId.(string), uuid.MustParse(ideaId), idea)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Idea updated successfully"})
}

func (h *ideaHandler) Delete(c *gin.Context) {
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

	err := h.service.Delete(c.Request.Context(), userId.(string), uuid.MustParse(ideaId))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Idea deleted successfully"})
}

func (h *ideaHandler) GetIdeas(c *gin.Context) {
	limit := 6
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}

	offset := 0
	if l := c.Query("offset"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			offset = n
		}
	}

	ideas, err := h.service.GetIdeas(c.Request.Context(), domain.QueryParams{
		Limit:  limit,
		Offset: offset,
		SortBy: c.Query("sortBy"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ideas)
}

func (h *ideaHandler) GetUserIdeas(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	limit := 10
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}

	offset := 0
	if l := c.Query("offset"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			offset = n
		}
	}

	getStats := c.Query("getStats")
	if getStats == "" {
		getStats = "false"
	}
	sortBy := c.Query("sortBy")
	filterBy := c.Query("filterBy")

	ideas, err := h.service.GetUserIdeas(c.Request.Context(), userId.(string), getStats == "true", domain.QueryParams{
		Limit:    limit,
		Offset:   offset,
		FilterBy: filterBy,
		SortBy:   sortBy,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ideas)
}

func (h *ideaHandler) GetByID(c *gin.Context) {
	ideaId := c.Param("ideaId")
	if ideaId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Idea ID is required"})
		return
	}

	userId, _ := c.Get("userId")
	var userIdStr string
	if userId != nil {
		userIdStr = userId.(string)
	}

	idea, err := h.service.GetByID(c.Request.Context(), uuid.MustParse(ideaId), userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, idea)
}
