package request

import "github.com/google/uuid"

type AIGenerate struct {
	Prompt string `json:"prompt" binding:"required"`
}

type GenerateLandingPage struct {
	Prompt          string    `json:"prompt" binding:"required"`
	IdeaID          uuid.UUID `json:"ideaId" binding:"required,uuid"`
	MVPId           uuid.UUID `json:"mvpId" binding:"uuid"`
	MetaTitle       *string   `json:"metaTitle"`
	MetaDescription *string   `json:"metaDescription"`
}
