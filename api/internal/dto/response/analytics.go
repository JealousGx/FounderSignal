package response

import (
	"foundersignal/internal/domain"
	"time"
)

type Analytics struct {
	TotalSignups     int     `json:"totalSignups"`
	SignupChange     float64 `json:"signupChange"`
	AvgConversion    float64 `json:"avgConversion"`
	ConversionChange float64 `json:"conversionChange"`
	IdeasValidated   int     `json:"ideasValidated"`
	IdeasChange      int     `json:"ideasChanged"`
	TimeToValidate   float64 `json:"timeToValidate"`
}

type IdeaWithActivity struct {
	domain.Idea
	LatestSignupDate *time.Time `gorm:"column:latest_signup"`
	LatestViewDate   *time.Time `gorm:"column:latest_view"`
}
