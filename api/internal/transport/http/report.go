package http

import (
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReportHandler interface {
	GenerateReport(c *gin.Context)
	GetReportsList(c *gin.Context)
	GetByID(c *gin.Context)

	SubmitContentReport(c *gin.Context)
	SubmitFeatureRequest(c *gin.Context)
	SubmitBugReport(c *gin.Context)
}

type reportHandler struct {
	service service.ReportService
}

func NewReportHandler(s service.ReportService) *reportHandler {
	return &reportHandler{
		service: s,
	}
}

func (h *reportHandler) GenerateReport(c *gin.Context) {
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

	ideaIdStr := c.Query("ideaId")
	var ideaId uuid.UUID
	if ideaIdStr != "" {
		_ideaId, err := uuid.Parse(ideaIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Idea ID"})
			return
		}

		ideaId = _ideaId
	}

	byIdeaStatusStr := c.Query("byIdeaStatus")
	var byIdeaStatus domain.IdeaStatus
	if byIdeaStatusStr != "" {
		byIdeaStatus = domain.IdeaStatus(byIdeaStatusStr)
	}

	if byIdeaStatus == "" && ideaId == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either Idea ID or By Idea Status is required"})
		return
	}

	reportType := c.Query("type")

	req := request.GenerateReportRequest{
		IdeaID:     ideaId,
		Type:       domain.ReportType(reportType),
		IdeaStatus: byIdeaStatus,
	}

	err := h.service.GenerateReports(c.Request.Context(), userIdStr, req)
	if err != nil {
		fmt.Println("Error generating report:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Report generation started"})
}

func (h *reportHandler) GetReportsList(c *gin.Context) {
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

	queryParams := getProcessedQueryParams(c)
	withStats := c.Query("getStats")
	specs := service.ReportSpecs{
		WithStats: withStats == "true",
	}

	res, err := h.service.GetReportsList(c.Request.Context(), userIdStr, queryParams, specs)
	if err != nil {
		fmt.Println("Error getting reports list:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *reportHandler) GetByID(c *gin.Context) {
	reportId := c.Param("reportId")
	if reportId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Report ID is required"})
		return
	}

	parsedReportId, err := uuid.Parse(reportId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// userIdStr, ok := userId.(string)
	// if !ok {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
	// 	return
	// }

	res, err := h.service.GetByID(c.Request.Context(), parsedReportId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if res == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *reportHandler) SubmitContentReport(c *gin.Context) {
	userId, _ := c.Get("userId")

	var req request.CreateContentReport
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SubmitContentReport(c.Request.Context(), userId.(string), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report submitted successfully"})
}

func (h *reportHandler) SubmitBugReport(c *gin.Context) {
	userId, _ := c.Get("userId")

	var req request.CreateBugReport
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SubmitBugReport(c.Request.Context(), userId.(string), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bug report submitted successfully. Thank you for your help!"})
}

func (h *reportHandler) SubmitFeatureRequest(c *gin.Context) {
	userId, _ := c.Get("userId")

	var req request.CreateFeatureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SubmitFeatureRequest(c.Request.Context(), userId.(string), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feature request submitted successfully. Thank you for your suggestion!"})
}
