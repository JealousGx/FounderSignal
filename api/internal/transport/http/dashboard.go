package http

import (
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardHandler interface {
	GetDashboardData(c *gin.Context)
	GetRecentActivity(c *gin.Context)
}

type dashboardHandler struct {
	service service.DashboardService
}

func NewDashboardHandler(s service.DashboardService) *dashboardHandler {
	return &dashboardHandler{
		service: s,
	}
}

func (h *dashboardHandler) GetDashboardData(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	data, err := h.service.GetDashboardData(c.Request.Context(), userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

func (h *dashboardHandler) GetRecentActivity(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	activities, err := h.service.GetRecentActivityForUser(c.Request.Context(), userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve recent activity: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, activities)
}
