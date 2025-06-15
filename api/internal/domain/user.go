package domain

import (
	"time"

	"gorm.io/gorm"
)

type UserPlan string

const (
	FreePlan     UserPlan = "free"
	ProPlan      UserPlan = "pro"
	BusinessPlan UserPlan = "business"
)

// User represents an application user, linked to a Clerk user.
// It stores application-specific data like subscription plan and limits.
type User struct {
	ID            string `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_clerk_id;primaryKey" json:"id"`
	Email         string `gorm:"type:varchar(255);not null" json:"email"`
	UsedFreeTrial bool   `gorm:"default:false" json:"usedFreeTrial"` // Indicates if the user has used the free plan. Allow only one idea creation on free plan. can be exploited by deleting and creating another idea.

	LastLoginAt *time.Time `gorm:"index" json:"lastLoginAt,omitempty"`

	Plan                     UserPlan   `gorm:"default:'free'" json:"plan"`
	IdeaLimit                int        `gorm:"not null" json:"ideaLimit"`
	RevenueCatSubscriptionID *string    `gorm:"type:varchar(255);index" json:"-"`
	SubscriptionStatus       string     `gorm:"type:varchar(50)" json:"subscriptionStatus,omitempty"` // e.g., active, expired, cancelled
	SubscriptionExpiresAt    *time.Time `json:"subscriptionExpiresAt,omitempty"`

	CreatedAt time.Time      `gorm:"not null;default:now()" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"not null;default:now()" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
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
		return 10
	case BusinessPlan:
		return 1000
	case FreePlan:
		fallthrough
	default:
		return 1
	}
}
