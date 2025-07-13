package repository

import (
	"context"
	"fmt"
	"foundersignal/internal/domain"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	Update(ctx context.Context, userID string, user *domain.User) error
	FindByID(ctx context.Context, userID string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	Delete(ctx context.Context, userID string) error
	FindByPaddleSubscriptionID(ctx context.Context, paddleSubscriptionID string) (*domain.User, error)
	FindByPaddleCustomerID(ctx context.Context, paddleCustomerID string) (*domain.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *userRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) Update(ctx context.Context, id string, user *domain.User) error {
	user.ID = id
	if err := r.db.WithContext(ctx).Model(user).Updates(user).Error; err != nil {
		fmt.Println("Error updating user:", err)

		return err
	}

	return nil
}

// FindByID retrieves a user by their Clerk ID.
func (r *userRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Unscoped().Delete(&domain.User{}, id).Error; err != nil {
		fmt.Println("Error deleting user:", err)
		return err
	}

	return nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return &user, err
}

func (r *userRepository) FindByPaddleSubscriptionID(ctx context.Context, paddleSubscriptionID string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("paddle_subscription_id = ?", paddleSubscriptionID).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return &user, err
}

func (r *userRepository) FindByPaddleCustomerID(ctx context.Context, paddleCustomerID string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("paddle_customer_id = ?", paddleCustomerID).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return &user, err
}
