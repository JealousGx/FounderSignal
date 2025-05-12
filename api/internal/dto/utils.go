package dto

import (
	"foundersignal/internal/domain"
	"math"
)

func calculateEngagementRate(idea *domain.Idea) float64 {

	if idea.Signups == 0 {
		return 0
	}

	return math.Round((float64(idea.Signups)/float64(idea.Views))*100) / 100
}
