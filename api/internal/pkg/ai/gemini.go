package ai

import (
	"context"
	"fmt"

	"google.golang.org/genai"
)

type geminiGenerator struct {
	client    *genai.Client
	modelCode string
}

func NewGeminiGenerator(ctx context.Context, apiKey string, modelCode string) (*geminiGenerator, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("gemini API key is required")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create genai client: %w", err)
	}

	return &geminiGenerator{
		client:    client,
		modelCode: modelCode,
	}, nil
}

func (g *geminiGenerator) GenerateContent(ctx context.Context, prompt string) (string, error) {
	resp, err := g.client.Models.GenerateContent(ctx, g.modelCode, genai.Text(prompt), nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate content from Gemini: %w", err)
	}

	return resp.Text(), nil
}
