package http

import (
	"errors"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MVPHandler interface {
	Create(c *gin.Context)
	Update(c *gin.Context)
	GetByIdea(c *gin.Context)
	GetByID(c *gin.Context)
	GetAllByIdea(c *gin.Context)
	SetActive(c *gin.Context)
	Delete(c *gin.Context)
	GenerateLandingPage(c *gin.Context)
}

type mvpHandler struct {
	service service.MVPService
}

func NewMVPHandler(s service.MVPService) *mvpHandler {
	return &mvpHandler{
		service: s,
	}
}

func (h *mvpHandler) Create(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	ideaIdStr := c.Param("ideaId")
	ideaId, err := uuid.Parse(ideaIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
		return
	}

	var req request.CreateMVP
	if err := c.ShouldBindJSON(&req); err != nil && err != io.EOF {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mvpId, err := h.service.Create(c.Request.Context(), userId.(string), ideaId, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mvpId": mvpId})
}

func (h *mvpHandler) GetByID(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	mvpIdStr := c.Param("mvpId")
	if mvpIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "MVP ID is required"})
		return
	}

	mvpId, err := uuid.Parse(mvpIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MVP ID"})
		return
	}

	ideaId, err := uuid.Parse(c.Param("ideaId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
		return
	}

	mvp, err := h.service.GetByID(c.Request.Context(), userId.(string), ideaId, mvpId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "MVP not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mvp)
}

func (h *mvpHandler) GetAllByIdea(c *gin.Context) {
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

	mvps, err := h.service.GetAllByIdea(c.Request.Context(), userId.(string), uuid.MustParse(ideaId))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No MVPs found for this idea"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mvps)
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

	var userIDPtr *string
	if userIDVal, exists := c.Get("userId"); exists {
		if userIDStr, ok := userIDVal.(string); ok {
			userIDPtr = &userIDStr
		}
	}

	mvp, err := h.service.GetByIdea(c.Request.Context(), parsedIdeaId, userIDPtr)
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

	mvpId := c.Param("mvpId")
	if mvpId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "MVP ID is required"})
		return
	}

	err := h.service.Update(c.Request.Context(), uuid.MustParse(ideaId), userId.(string), uuid.MustParse(mvpId), mvp)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "MVP not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "MVP updated successfully"})
}

func (h *mvpHandler) SetActive(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	ideaIdStr := c.Param("ideaId")
	ideaId, err := uuid.Parse(ideaIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
		return
	}

	mvpIdStr := c.Param("mvpId")
	mvpId, err := uuid.Parse(mvpIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MVP ID"})
		return
	}

	err = h.service.SetActive(c.Request.Context(), userId.(string), ideaId, mvpId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "MVP not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "MVP set to active"})
}

func (h *mvpHandler) Delete(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	ideaIdStr := c.Param("ideaId")
	ideaId, err := uuid.Parse(ideaIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid idea ID"})
		return
	}

	mvpIdStr := c.Param("mvpId")
	mvpId, err := uuid.Parse(mvpIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MVP ID"})
		return
	}

	err = h.service.Delete(c.Request.Context(), userId.(string), ideaId, mvpId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "MVP not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "MVP deleted successfully"})
}

func (h *mvpHandler) GenerateLandingPage(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req request.GenerateLandingPage
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	htmlContent, err := h.service.GenerateLandingPage(c.Request.Context(), req.MVPId, req.IdeaID, userId.(string), req.Prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": htmlContent})
}
