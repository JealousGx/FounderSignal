package dto

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
)

func ToCreateIdeaRequest(idea *domain.Idea) *request.CreateIdea {
	return &request.CreateIdea{
		UserID:         idea.UserID,
		Title:          idea.Title,
		Description:    idea.Description,
		TargetAudience: idea.TargetAudience,
		CTAButton:      idea.MVPSimulator.CTAButton,
	}
}
