package service

import (
	"context"
	"foundersignal/internal/pkg/ai"
)

type AIService interface {
	Generate(ctx context.Context, prompt string) (string, error)
}

type aiService struct {
	generator *ai.AIGenerator
}

func NewAIService(generator *ai.AIGenerator) AIService {
	return &aiService{
		generator: generator,
	}
}

func (s *aiService) Generate(ctx context.Context, prompt string) (string, error) {
	return s.generator.Gemini.GenerateContent(ctx, prompt)
}
