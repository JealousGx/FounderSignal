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

type PlanDetails struct {
	IdeaLimit  int
	MVPLimit   int
	AIGenLimit int
}

var PlanConfig = map[UserPlan]PlanDetails{
	StarterPlan: {
		IdeaLimit:  StarterIdeaLimit,
		MVPLimit:   StarterMVPLimit,
		AIGenLimit: StarterAIGenLimit,
	},
	ProPlan: {
		IdeaLimit:  ProIdeaLimit,
		MVPLimit:   ProMVPLimit,
		AIGenLimit: ProAIGenLimit,
	},
	BusinessPlan: {
		IdeaLimit:  BusinessIdeaLimit,
		MVPLimit:   BusinessMVPLimit,
		AIGenLimit: BusinessAIGenLimit,
	},
}

// User represents an application user, linked to a Clerk user.
// It stores application-specific data like subscription plan and limits.
type User struct {
	ID        string `gorm:"type:varchar(255);not null;primaryKey" json:"id"`
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

func (u *User) BeforeSave(tx *gorm.DB) (err error) {
	if tx.Statement.Changed("Plan") || u.IdeaLimit == 0 {
		u.IdeaLimit = GetIdeaLimitForPlan(u.Plan)
	}
	return nil
}

// GetPlanDetails retrieves the full configuration for a given plan.
func GetPlanDetails(plan UserPlan) PlanDetails {
	details, ok := PlanConfig[plan]

	if !ok {
		// Default to starter plan if the plan is unknown
		return PlanConfig[StarterPlan]
	}
	return details
}

func GetIdeaLimitForPlan(plan UserPlan) int {
	return GetPlanDetails(plan).IdeaLimit

}

func GetMVPLimitForPlan(plan UserPlan) int {
	return GetPlanDetails(plan).MVPLimit
}

func GetAIGenLimitForPlan(plan UserPlan) int {
	return GetPlanDetails(plan).AIGenLimit
}
