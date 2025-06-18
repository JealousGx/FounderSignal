package service

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/repository"
	"log"
	"time"

	"gorm.io/gorm"
)

type UserService interface {
	ClerkUser(ctx context.Context, eventType string, clerkUser request.ClerkUserCreateRequest) error
	Update(ctx context.Context, user *domain.User) error
	FindById(ctx context.Context, userID string) (*domain.User, error)
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) *userService {
	return &userService{userRepo: userRepo}
}

func (s *userService) FindById(ctx context.Context, userId string) (*domain.User, error) {
	user, err := s.userRepo.FindByID(ctx, userId)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("User with ID %s not found in DB.", userId)
			return nil, fmt.Errorf("user with ID %s not found", userId)
		}

		log.Printf("Error finding user %s in DB: %v", userId, err)
		return nil, err
	}

	return user, nil
}

func (s *userService) ClerkUser(ctx context.Context, eventType string, clerkUser request.ClerkUserCreateRequest) error {
	// Check if user already exists to handle potential webhook retries or out-of-order events
	existingUser, err := s.userRepo.FindByID(ctx, clerkUser.ID)
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Printf("Error checking for existing user %s: %v", clerkUser.ID, err)
		return err
	}

	var verifiedEmail string
	for _, email := range clerkUser.EmailAddresses {
		if email.Verification.Status == "verified" {
			verifiedEmail = email.EmailAddress
		}
	}

	newUser := &domain.User{
		ID:    clerkUser.ID,
		Email: verifiedEmail,
	}

	var parsedUpdatedAt *time.Time
	parsedUpdatedAt, err = parseTime(clerkUser.UpdatedAt)
	if err != nil {
		log.Printf("Error parsing updatedAt of user %s, %v", clerkUser.ID, err)
		return err
	}

	newUser.UpdatedAt = *parsedUpdatedAt

	switch eventType {
	case "user.created":
		if existingUser != nil {
			log.Printf("User with Clerk ID %s already exists. Skipping creation.", clerkUser.ID)
			return nil
		}

		var parsedCreatedAt *time.Time
		parsedCreatedAt, err = parseTime(clerkUser.CreatedAt)
		if err != nil {
			log.Printf("Error parsing createdAt of user %s, %v", clerkUser.ID, err)
			return err
		}

		newUser.CreatedAt = *parsedCreatedAt
		newUser.Plan = domain.FreePlan

		if err := s.userRepo.Create(ctx, newUser); err != nil {
			log.Printf("Error creating user %s in DB: %v", clerkUser.ID, err)
			return err
		}

	case "user.updated":
		if existingUser == nil {
			log.Printf("User with Clerk ID %s does not exist in DB. Cannot update.", clerkUser.ID)
			return fmt.Errorf("user with ID %s does not exist", clerkUser.ID)
		}

		if err := s.userRepo.Update(ctx, clerkUser.ID, newUser); err != nil {
			log.Printf("Error updating user %s in DB: %v", clerkUser.ID, err)
			return err
		}

	case "user.deleted":
		// if clerkUser.Deleted is not true, we assume it's not a deletion event
		if !clerkUser.Deleted {
			log.Printf("Received user.deleted event for %s, but user is not marked as deleted. Skipping deletion.", clerkUser.ID)
			return nil
		}

		if existingUser == nil {
			log.Printf("User with Clerk ID %s does not exist in DB. Cannot delete.", clerkUser.ID)
			return fmt.Errorf("user with ID %s does not exist", clerkUser.ID)
		}

		if err := s.userRepo.Delete(ctx, clerkUser.ID); err != nil {
			log.Printf("Error deleting user %s: %v", clerkUser.ID, err)
			return err
		}

	default:
		log.Printf("Received unhandled webhook event type: %s", eventType)
		return fmt.Errorf("received unhandled webhook event type: %s", eventType)
	}

	log.Printf("Successfully created user %s in DB from webhook.", newUser.ID)
	return nil
}

func (s *userService) Update(ctx context.Context, user *domain.User) error {
	existingUser, err := s.userRepo.FindByID(ctx, user.ID)
	if err != nil {
		log.Printf("Error finding user %s in DB: %v", user.ID, err)
		return err
	}

	if existingUser == nil {
		log.Printf("User with ID %s does not exist in DB. Cannot update.", user.ID)
		return fmt.Errorf("user with ID %s does not exist", user.ID)
	}

	if err := s.userRepo.Update(ctx, user.ID, user); err != nil {
		log.Printf("Error updating user %s: %v", user.ID, err)
		return err
	}
	log.Printf("Successfully updated user %s in DB.", user.ID)
	return nil
}

func parseTime(unixMillis int64) (*time.Time, error) {
	// Clerk typically provides timestamps in milliseconds.
	seconds := unixMillis / 1000
	nanoseconds := (unixMillis % 1000) * 1000000
	t := time.Unix(seconds, nanoseconds)
	return &t, nil
}
