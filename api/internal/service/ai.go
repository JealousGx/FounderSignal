package service

import (
	"context"
	"foundersignal/internal/pkg/ai"
)

type AIService interface {
	Generate(ctx context.Context, prompt string) (string, error)
	CreateEmbeddings(ctx context.Context, texts []string) ([][]float32, error)
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

func (s *aiService) CreateEmbeddings(ctx context.Context, texts []string) ([][]float32, error) {
	return s.generator.Gemini.CreateEmbeddings(ctx, texts)
}
