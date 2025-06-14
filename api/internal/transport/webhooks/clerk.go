package webhooks

import (
	"bytes"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/service"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkHandler interface {
	Handler(c *gin.Context)
}

type clerkHandler struct {
	userService        service.UserService
	clerkWebhookSecret string
}

func NewClerkHandler(us service.UserService, clerkWebhookSecret string) *clerkHandler {
	return &clerkHandler{
		userService:        us,
		clerkWebhookSecret: clerkWebhookSecret,
	}
}

func (h *clerkHandler) Handler(c *gin.Context) {
	if h.clerkWebhookSecret == "" {
		log.Println("Error: Clerk webhook signing secret is not configured.")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook processing misconfigured"})
		return
	}

	wh, err := svix.NewWebhook(h.clerkWebhookSecret)
	if err != nil {
		log.Printf("Error creating Svix webhook verifier: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook verification setup failed"})
		return
	}

	// Read the body for verification
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading webhook body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot read request body"})
		return
	}
	// Restore the body so it can be read again by c.ShouldBindJSON
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	headers := c.Request.Header
	payload := bodyBytes

	// Verify the webhook signature
	if err := wh.Verify(payload, headers); err != nil {
		log.Printf("Error verifying webhook signature: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Webhook signature verification failed"})
		return
	}

	var event request.ClerkEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		log.Printf("Error binding webhook JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	log.Printf("Received Clerk webhook. Type: %s, UserID: %s", event.Type, event.Data.ID)

	clerkUserErr := h.userService.ClerkUser(c.Request.Context(), event.Type, event.Data)
	if clerkUserErr != nil {
		log.Printf("Error processing %s webhook for %s: %v", event.Type, event.Data.ID, clerkUserErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": clerkUserErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook received and user processed successfully"})
}
