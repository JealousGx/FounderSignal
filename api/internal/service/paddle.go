package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/repository"
	"log"
	"time"

	"github.com/PaddleHQ/paddle-go-sdk"
	"github.com/PaddleHQ/paddle-go-sdk/pkg/paddlenotification"
	"gorm.io/gorm"
)

type PaddleService interface {
	ProcessEvent(ctx context.Context, eventID string, eventType paddlenotification.EventTypeName, requestBody []byte) error
	handleSubscriptionCreated(ctx context.Context, data paddle.SubscriptionCreatedEvent) error
	handleSubscriptionUpdated(ctx context.Context, data paddle.SubscriptionUpdatedEvent) error
	handleSubscriptionCanceled(ctx context.Context, data paddle.SubscriptionCanceledEvent) error
	handleSubscriptionActivated(ctx context.Context, data paddle.SubscriptionActivatedEvent) error
	handleSubscriptionPaused(ctx context.Context, data paddle.SubscriptionPausedEvent) error
	handleSubscriptionResumed(ctx context.Context, data paddle.SubscriptionResumedEvent) error
}

type PaddleServiceConfig struct {
	StarterPlanID  string
	ProPlanID      string
	BusinessPlanID string
}

type paddleService struct {
	userRepo           repository.UserRepository
	processedEventRepo repository.PaddleRepository
	cfg                PaddleServiceConfig
}

func NewPaddleService(userRepo repository.UserRepository, processedEventRepo repository.PaddleRepository, cfg PaddleServiceConfig) *paddleService {
	return &paddleService{
		userRepo:           userRepo,
		processedEventRepo: processedEventRepo,
		cfg:                cfg,
	}
}

func (s *paddleService) ProcessEvent(ctx context.Context, eventID string, eventType paddlenotification.EventTypeName, requestBody []byte) error {
	exists, err := s.processedEventRepo.Exists(ctx, eventID)
	if err != nil {
		return err
	}
	if exists {
		return nil // Event already processed
	}

	var processingError error

	switch eventType {
	case paddlenotification.EventTypeNameSubscriptionCreated:
		var sub paddle.SubscriptionCreatedEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionCreated event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionCreated event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionCreated(ctx, sub)
		}

	case paddlenotification.EventTypeNameSubscriptionUpdated:
		var sub paddle.SubscriptionUpdatedEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionUpdated event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionUpdated event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionUpdated(ctx, sub)
		}

	case paddlenotification.EventTypeNameSubscriptionCanceled:
		var sub paddle.SubscriptionCanceledEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionCanceled event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionCanceled event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionCanceled(ctx, sub)
		}

	case paddlenotification.EventTypeNameSubscriptionPaused:
		var sub paddle.SubscriptionPausedEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionPaused event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionPaused event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionPaused(ctx, sub)
		}

	case paddlenotification.EventTypeNameSubscriptionResumed:
		var sub paddle.SubscriptionResumedEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionResumed event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionResumed event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionResumed(ctx, sub)
		}

	case paddlenotification.EventTypeNameSubscriptionActivated:
		var sub paddle.SubscriptionActivatedEvent
		if err := json.Unmarshal(requestBody, &sub); err != nil {
			log.Printf("Error unmarshalling SubscriptionActivated event: %v", err)
			processingError = fmt.Errorf("error unmarshalling SubscriptionActivated event %s: %w", eventID, err)
		} else {
			processingError = s.handleSubscriptionActivated(ctx, sub)
		}

	default:
		log.Printf("Unhandled Paddle event type: %s for event ID: %s", eventType, eventID)
		return nil
	}

	if processingError != nil {
		log.Printf("Error processing Paddle event %s (type %s): %v", eventID, eventType, processingError)
		return processingError
	}

	// Create a new processed event record
	if err := s.processedEventRepo.Create(ctx, eventID, string(eventType)); err != nil {
		return err
	}

	log.Printf("Successfully processed and marked Paddle event %s (type %s)", eventID, eventType)
	return nil
}

func (s *paddleService) handleSubscriptionCreated(ctx context.Context, evt paddle.SubscriptionCreatedEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionCreated: PaddleSubscriptionID=%s, CustomerID=%s", data.ID, data.CustomerID)

	var userID string
	var userEmail string
	if data.CustomData != nil {
		if id, ok := data.CustomData["userId"].(string); ok && id != "" {
			userID = id
		}

		if email, ok := data.CustomData["userEmail"].(string); ok && email != "" {
			userEmail = email
		}
	}

	var user *domain.User
	var err error

	if userID != "" {
		user, err = s.userRepo.FindByID(ctx, userID)
		if err != nil && err != gorm.ErrRecordNotFound {
			return fmt.Errorf("error finding user by ID %s: %w", userID, err)
		}
	}

	if user == nil && userEmail != "" {
		user, err = s.userRepo.FindByEmail(ctx, userEmail)
		if err != nil && err != gorm.ErrRecordNotFound {
			return fmt.Errorf("error finding user by Email %s: %w", userID, err)
		}
	}

	if user == nil && data.CustomerID != "" { // Fallback or primary way to find user by Paddle Customer ID
		user, err = s.userRepo.FindByPaddleCustomerID(ctx, data.CustomerID)
		if err != nil && err != gorm.ErrRecordNotFound {
			return fmt.Errorf("error finding user by Paddle Customer ID %s: %w", data.CustomerID, err)
		}
	}

	if user == nil {
		log.Printf("No user found for PaddleSubscriptionID %s (CustomerID: %s, CustomData UserID: %s). Cannot process SubscriptionCreated.", data.ID, data.CustomerID, userID)
		return fmt.Errorf("user not found for subscription %s", data.ID)
	}

	updates := domain.User{
		PaddleSubscriptionID: &data.ID,
		PaddleCustomerID:     &data.CustomerID,
		SubscriptionStatus:   string(data.Status),
		IsPaying:             data.Status == "active",
	}

	if len(data.Items) > 0 {
		updates.PaddlePlanID = &data.Items[0].Price.ID
	}

	if data.CurrentBillingPeriod != nil && data.CurrentBillingPeriod.EndsAt != "" {
		expiresAt, err := time.Parse(time.RFC3339, data.CurrentBillingPeriod.EndsAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		} else {
			log.Printf("Error parsing CurrentBillingPeriod.EndsAt for sub %s: %v", data.ID, err)
		}
	} else if data.NextBilledAt != nil { // Fallback for expiry
		expiresAt, err := time.Parse(time.RFC3339, *data.NextBilledAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		} else {
			log.Printf("Error parsing NextBilledAt for sub %s: %v", data.ID, err)
		}
	}

	// Map Paddle plan to internal plan if necessary
	// For now, we assume PaddlePlanID is sufficient.
	// user.Plan = s.mapPaddlePlanToInternalPlan(updates.PaddlePlanID)

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) handleSubscriptionUpdated(ctx context.Context, evt paddle.SubscriptionUpdatedEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionUpdated: PaddleSubscriptionID=%s, Status=%s", data.ID, data.Status)

	user, err := s.userRepo.FindByPaddleSubscriptionID(ctx, data.ID)
	if err != nil {
		return fmt.Errorf("error finding user by PaddleSubscriptionID %s: %w", data.ID, err)
	}
	if user == nil {
		return fmt.Errorf("user not found for PaddleSubscriptionID %s", data.ID)
	}

	updates := domain.User{
		SubscriptionStatus: string(data.Status),
		IsPaying:           data.Status == "active",
	}

	if len(data.Items) > 0 && user.PaddlePlanID == nil || (user.PaddlePlanID != nil && *user.PaddlePlanID != data.Items[0].Price.ID) {
		updates.PaddlePlanID = &data.Items[0].Price.ID
	}

	if data.CurrentBillingPeriod != nil && data.CurrentBillingPeriod.EndsAt != "" {
		expiresAt, err := time.Parse(time.RFC3339, data.CurrentBillingPeriod.EndsAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		} else {
			log.Printf("Error parsing CurrentBillingPeriod.EndsAt for sub %s: %v", data.ID, err)
		}
	} else if data.NextBilledAt != nil {
		expiresAt, err := time.Parse(time.RFC3339, *data.NextBilledAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		} else {
			log.Printf("Error parsing NextBilledAt for sub %s: %v", data.ID, err)
		}
	}

	if data.Status == "paused" && data.PausedAt != nil {
		pausedAt, err := time.Parse(time.RFC3339, *data.PausedAt)
		if err == nil {
			updates.SubscriptionPausedAt = &pausedAt
		}
	} else if data.Status != "paused" {
		var nullTime *time.Time
		updates.SubscriptionPausedAt = nullTime
	}

	if data.Status == "canceled" && data.CanceledAt != nil {
		cancelledAt, err := time.Parse(time.RFC3339, *data.CanceledAt)
		if err == nil {
			updates.SubscriptionCancelledAt = &cancelledAt
		}
	}

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) handleSubscriptionCanceled(ctx context.Context, evt paddle.SubscriptionCanceledEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionCanceled: PaddleSubscriptionID=%s", data.ID)

	user, err := s.userRepo.FindByPaddleSubscriptionID(ctx, data.ID)
	if err != nil {
		return fmt.Errorf("error finding user by PaddleSubscriptionID %s: %w", data.ID, err)
	}
	if user == nil {
		return fmt.Errorf("user not found for PaddleSubscriptionID %s", data.ID)
	}

	updates := domain.User{
		SubscriptionStatus: string(paddle.SubscriptionStatusCanceled),
		IsPaying:           false,
		Plan:               domain.StarterPlan, // Default to Starter plan on cancellation
	}
	if data.CanceledAt != nil {
		cancelledAt, err := time.Parse(time.RFC3339, *data.CanceledAt)
		if err == nil {
			updates.SubscriptionCancelledAt = &cancelledAt
		} else {
			log.Printf("Error parsing CanceledAt for sub %s: %v", data.ID, err)
		}
	}
	// SubscriptionExpiresAt might still be in the future if canceled mid-period
	// Paddle's `ends_at` on the subscription object (if available in this event data) or `scheduled_change.effective_at`
	// would indicate when access truly ends. For now, we rely on the status.

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) handleSubscriptionActivated(ctx context.Context, evt paddle.SubscriptionActivatedEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionActivated: PaddleSubscriptionID=%s", data.ID)

	user, err := s.userRepo.FindByPaddleSubscriptionID(ctx, data.ID)
	if err != nil {
		return fmt.Errorf("error finding user by PaddleSubscriptionID %s: %w", data.ID, err)
	}
	if user == nil {
		log.Printf("User not found for PaddleSubscriptionID %s during SubscriptionActivated. This might be an issue.", data.ID)
		return fmt.Errorf("user not found for PaddleSubscriptionID %s", data.ID)
	}

	updates := domain.User{
		SubscriptionStatus: string(paddle.SubscriptionStatusActive),
		IsPaying:           data.Status == "active",
		Plan:               s.mapPaddlePlanToInternalPlan(&data.Items[0].Price.ProductID),
	}
	var nullTime *time.Time
	updates.SubscriptionPausedAt = nullTime

	if len(data.Items) > 0 {
		updates.PaddlePlanID = &data.Items[0].Price.ID
	}

	if data.CurrentBillingPeriod != nil && data.CurrentBillingPeriod.EndsAt != "" {
		expiresAt, err := time.Parse(time.RFC3339, data.CurrentBillingPeriod.EndsAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		}
	} else if data.NextBilledAt != nil {
		expiresAt, err := time.Parse(time.RFC3339, *data.NextBilledAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		}
	}

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) handleSubscriptionPaused(ctx context.Context, evt paddle.SubscriptionPausedEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionPaused: PaddleSubscriptionID=%s", data.ID)

	user, err := s.userRepo.FindByPaddleSubscriptionID(ctx, data.ID)
	if err != nil {
		return fmt.Errorf("error finding user by PaddleSubscriptionID %s: %w", data.ID, err)
	}
	if user == nil {
		return fmt.Errorf("user not found for PaddleSubscriptionID %s", data.ID)
	}

	updates := domain.User{
		SubscriptionStatus: string(paddle.SubscriptionStatusPaused),
		IsPaying:           false,
		Plan:               domain.StarterPlan, // Default to Starter plan on pause
	}

	if data.PausedAt != nil {
		pausedAt, err := time.Parse(time.RFC3339, *data.PausedAt)
		if err == nil {
			updates.SubscriptionPausedAt = &pausedAt
		} else {
			log.Printf("Error parsing PausedAt for sub %s: %v", data.ID, err)
		}
	}

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) handleSubscriptionResumed(ctx context.Context, evt paddle.SubscriptionResumedEvent) error {
	data := evt.Data

	log.Printf("Handling SubscriptionResumed: PaddleSubscriptionID=%s", data.ID)

	user, err := s.userRepo.FindByPaddleSubscriptionID(ctx, data.ID)
	if err != nil {
		return fmt.Errorf("error finding user by PaddleSubscriptionID %s: %w", data.ID, err)
	}
	if user == nil {
		return fmt.Errorf("user not found for PaddleSubscriptionID %s", data.ID)
	}

	updates := domain.User{
		SubscriptionStatus: string(paddle.SubscriptionStatusActive),
		IsPaying:           data.Status == "active",
	}
	var nullTime *time.Time
	updates.SubscriptionPausedAt = nullTime

	if data.CurrentBillingPeriod != nil && data.CurrentBillingPeriod.EndsAt != "" {
		expiresAt, err := time.Parse(time.RFC3339, data.CurrentBillingPeriod.EndsAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		}
	} else if data.NextBilledAt != nil {
		expiresAt, err := time.Parse(time.RFC3339, *data.NextBilledAt)
		if err == nil {
			updates.SubscriptionExpiresAt = &expiresAt
		}
	}

	return s.userRepo.Update(ctx, user.ID, &updates)
}

func (s *paddleService) mapPaddlePlanToInternalPlan(paddlePlanID *string) domain.UserPlan {
	if paddlePlanID == nil {
		return domain.StarterPlan // Default plan if none specified
	}

	switch *paddlePlanID {
	case s.cfg.ProPlanID:
		return domain.ProPlan
	case s.cfg.BusinessPlanID:
		return domain.BusinessPlan
	default:
		return domain.StarterPlan
	}
}
