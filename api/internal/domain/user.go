package domain

import (
	"time"

	"gorm.io/gorm"
)

type UserPlan string

const (
	StarterPlan  UserPlan = "starter"
	ProPlan      UserPlan = "pro"
	BusinessPlan UserPlan = "business"
)

const (
	StarterIdeaLimit  = 1
	ProIdeaLimit      = 10
	BusinessIdeaLimit = 1000

	StarterMVPLimit  = 1
	ProMVPLimit      = 5
	BusinessMVPLimit = 20

	// per MVP
	StarterAIGenLimit  = 3
	ProAIGenLimit      = 5
	BusinessAIGenLimit = 10

	DefaultMVPLimit   = 1
	DefaultAIGenLimit = 3
	DefaultIdeaLimit  = 1
)

// User represents an application user, linked to a Clerk user.
// It stores application-specific data like subscription plan and limits.
type User struct {
	ID        string `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_clerk_id;primaryKey" json:"id"`
	Username  string `gorm:"type:varchar(255);uniqueIndex:idx_user_username" json:"username,omitempty"` // Unique username for the user, can be used for login
	Email     string `gorm:"type:varchar(255);uniqueIndex" json:"email"`
	FirstName string `gorm:"type:varchar(255)" json:"firstName,omitempty"`
	LastName  string `gorm:"type:varchar(255)" json:"lastName,omitempty"`
	ImageURL  string `gorm:"type:varchar(1024)" json:"imageUrl,omitempty"`

	LastLoginAt *time.Time `gorm:"index" json:"lastLoginAt,omitempty"`

	Plan          UserPlan `gorm:"default:'starter'" json:"plan"`
	IdeaLimit     int      `gorm:"not null" json:"ideaLimit"`
	UsedFreeTrial bool     `gorm:"default:false" json:"usedFreeTrial"` // Indicates if the user has used the free plan. Allow only one idea creation on free plan. can be exploited by deleting and creating another idea.
	IsPaying      bool     `gorm:"default:false" json:"isPaying"`      // Derived from active subscription

	ActiveIdeaCount int64 `gorm:"-" json:"activeIdeaCount,omitempty"` // Populated at runtime

	// paddle / subscription specific fields
	PaddleSubscriptionID    *string    `gorm:"type:varchar(255);index" json:"paddleSubscriptionId,omitempty"`
	PaddleCustomerID        *string    `gorm:"type:varchar(255);index" json:"paddleCustomerId,omitempty"`
	PaddlePlanID            *string    `gorm:"type:varchar(255)" json:"paddlePlanId,omitempty"`      // Paddle's specific plan/price ID
	SubscriptionStatus      string     `gorm:"type:varchar(50)" json:"subscriptionStatus,omitempty"` // e.g., active, trialing, past_due, paused, canceled
	SubscriptionExpiresAt   *time.Time `json:"subscriptionExpiresAt,omitempty"`                      // When the current period ends or access expires
	SubscriptionCancelledAt *time.Time `json:"subscriptionCancelledAt,omitempty"`                    // When the cancellation was requested
	SubscriptionPausedAt    *time.Time `json:"subscriptionPausedAt,omitempty"`                       // When the subscription was paused

	CreatedAt time.Time      `gorm:"not null;default:now()" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"not null;default:now()" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Ideas []Idea `gorm:"foreignKey:UserID" json:"ideas,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.IdeaLimit == 0 {
		u.IdeaLimit = GetIdeaLimitForPlan(u.Plan)
	}
	return nil
}

func GetIdeaLimitForPlan(plan UserPlan) int {
	switch plan {
	case ProPlan:
		return ProIdeaLimit
	case BusinessPlan:
		return BusinessIdeaLimit
	case StarterPlan:
		fallthrough
	default:
		return StarterIdeaLimit
	}
}

func GetMVPLimitForPlan(plan UserPlan) int {
	switch plan {
	case ProPlan:
		return ProMVPLimit
	case BusinessPlan:
		return BusinessMVPLimit
	case StarterPlan:
		fallthrough
	default:
		return StarterMVPLimit
	}
}

func GetAIGenLimitForPlan(plan UserPlan) int {
	switch plan {
	case ProPlan:
		return ProAIGenLimit
	case BusinessPlan:
		return BusinessAIGenLimit
	case StarterPlan:
		fallthrough
	default:
		return StarterAIGenLimit
	}
}
