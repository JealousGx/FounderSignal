package webhooks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"foundersignal/internal/service"
	"io"
	"log"
	"net/http"

	"github.com/PaddleHQ/paddle-go-sdk"
	"github.com/PaddleHQ/paddle-go-sdk/pkg/paddlenotification"
	"github.com/gin-gonic/gin"
)

type PaddleHandler interface {
	Handler(c *gin.Context)
}

type paddleHandler struct {
	paddleService service.PaddleService
	webhookSecret string
}

type PaddleWebhookEvent struct {
	EventID   string                           `json:"event_id"`
	EventType paddlenotification.EventTypeName `json:"event_type"`
}

func NewPaddleHandler(ps service.PaddleService, webhookSecret string) *paddleHandler {
	return &paddleHandler{
		paddleService: ps,
		webhookSecret: webhookSecret,
	}
}

func (h *paddleHandler) Handler(c *gin.Context) {
	requestBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading Paddle webhook request body: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}

	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))

	whVerifier := paddle.NewWebhookVerifier(h.webhookSecret)
	_, err = whVerifier.Verify(c.Request)
	if err != nil {
		log.Printf("Error verifying Paddle webhook: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
		return
	}

	var evt PaddleWebhookEvent
	if err := json.Unmarshal(requestBody, &evt); err != nil {
		log.Printf("Error unmarshalling Paddle webhook JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if evt.EventID == "" || evt.EventType == "" {
		log.Printf("Paddle webhook missing event_id or event_type. Body: %s", string(requestBody))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing event_id or event_type"})
		return
	}

	fmt.Printf("Received Paddle event: %s, EventID: %s\n", evt.EventType, evt.EventID)

	if err := h.paddleService.ProcessEvent(c.Request.Context(), evt.EventID, evt.EventType, requestBody); err != nil {
		log.Printf("Error processing Paddle event %s (type %s) by user service: %v", evt.EventID, evt.EventType, err)

		// Return 500 to signal Paddle to retry, unless it's a non-retryable error (e.g., bad request from Paddle)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook processed with internal error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook received and processed successfully"})
}
