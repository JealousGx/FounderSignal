package http

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IdeaHandler interface {
	Create(c *gin.Context)
	GetIdeas(c *gin.Context)
	GetByID(c *gin.Context)
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

func (h *ideaHandler) GetIdeas(c *gin.Context) {
	limit := 2
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

// func (h *IdeaHandler) GetTopIdeas(c *gin.Context) {
// 	userId, exists := c.Get("userId")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
// 		return
// 	}

// 	limit := 7
// 	if l := c.Query("limit"); l != "" {
// 		if n, err := strconv.Atoi(l); err == nil && n > 0 {
// 			limit = n
// 		}
// 	}

// 	offset := 0
// 	if l := c.Query("offset"); l != "" {
// 		if n, err := strconv.Atoi(l); err == nil && n > 0 {
// 			offset = n
// 		}
// 	}

// 	ideas, err := h.service.GetTopIdeas(c.Request.Context(), userId.(string), domain.QueryParams{
// 		Limit:  limit,
// 		Offset: offset,
// 	})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, ideas)
// }

func isDashboardRequest(c *gin.Context) bool {
	return strings.HasPrefix(c.Request.URL.Path, "/api/v1/dashboard")
}
