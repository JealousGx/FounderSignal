package http

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/dto"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IdeaHandler struct {
	service service.IdeaService
}

func NewIdeaHandler(s service.IdeaService) *IdeaHandler {
	return &IdeaHandler{
		service: s,
	}
}

func (h *IdeaHandler) Create(c *gin.Context) {
	var idea domain.Idea

	if err := c.ShouldBindJSON(&idea); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dto := dto.ToCreateIdeaRequest(&idea)

	createdIdeaId, err := h.service.Create(c.Request.Context(), dto)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": createdIdeaId})
}

func (h *IdeaHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid idea id"})
		return
	}

	idea, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, idea)
}

func (h *IdeaHandler) GetAll(c *gin.Context) {
	isDashboard := isDashboardRequest(c)

	ideas, err := h.service.GetAll(c.Request.Context(), isDashboard)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ideas)
}

func (h *IdeaHandler) UpdateMVP(c *gin.Context) {
	ideaId, err := uuid.Parse(c.Param("ideaId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID format"})
		return
	}
	mvpIdStr := c.Param("mvpId")

	mvpId, err := uuid.Parse(mvpIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid mvp id"})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req *request.UpdateMVP
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateMVP(c.Request.Context(), mvpId, ideaId, userId.(string), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "MVP updated successfully"})
}

func isDashboardRequest(c *gin.Context) bool {
	return strings.HasPrefix(c.Request.URL.Path, "/api/v1/dashboard")
}
