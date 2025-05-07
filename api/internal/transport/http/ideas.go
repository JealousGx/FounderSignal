package http

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type IdeasHandler struct {
	service *service.IdeasService
}

func NewIdeasHandler(s *service.IdeasService) *IdeasHandler {
	return &IdeasHandler{
		service: s,
	}
}

func (h *IdeasHandler) Create(c *gin.Context) {
	var idea domain.Idea

	if err := c.ShouldBindJSON(&idea); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(c.Request.Context(), &idea); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, idea)
}

func (h *IdeasHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	idea, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, idea)
}

func (h *IdeasHandler) GetAll(c *gin.Context) {
	ideas, err := h.service.GetAll(c.Request.Context())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ideas)
}
