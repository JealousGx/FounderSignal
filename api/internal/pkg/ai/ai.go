package ai

import (
	"context"
)

// Generator defines the common interface that every AI model client must implement.
type generator interface {
	GenerateContent(ctx context.Context, prompt string) (string, error)
	CreateEmbeddings(ctx context.Context, texts []string) ([][]float32, error)
}

// AIGenerator defines the interface for a generic AI content generator.
// This allows for swapping different AI models (Gemini, OpenAI, etc.) in the future.
type AIGenerator struct {
	Gemini generator
}

type AIConfig struct {
	GeminiAPIKey             string
	GeminiModelCode          string
	GeminiEmbeddingModelCode string
}

func NewAIGenerator(ctx context.Context, cfg AIConfig) (*AIGenerator, error) {
	geminiGen, err := NewGeminiGenerator(ctx, cfg.GeminiAPIKey, cfg.GeminiModelCode)
	if err != nil {
		return nil, err
	}

	return &AIGenerator{
		Gemini: geminiGen,
	}, nil
}
