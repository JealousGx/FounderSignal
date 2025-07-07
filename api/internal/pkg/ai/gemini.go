package ai

import (
	"context"
	"fmt"
	"log"

	"google.golang.org/genai"
)

type geminiGenerator struct {
	client             *genai.Client
	modelCode          string
	embeddingModelCode string
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

func (g *geminiGenerator) CreateEmbeddings(ctx context.Context, texts []string) ([][]float32, error) {
	const batchSize = 100 // Gemini API limit for batch embeddings
	var allEmbeddings [][]float32

	for i := 0; i < len(texts); i += batchSize {
		end := i + batchSize
		if end > len(texts) {
			end = len(texts)
		}
		textChunk := texts[i:end]

		// Prepare the content for the current batch.
		contents := make([]*genai.Content, 0, len(textChunk))
		for _, text := range textChunk {
			// Use a space for empty strings to avoid potential API errors.
			if text == "" {
				text = " "
			}
			contents = append(contents, genai.NewContentFromText(text, genai.RoleUser))
		}

		// Use the older EmbedContent method with batching.
		res, err := g.client.Models.EmbedContent(ctx,
			g.embeddingModelCode,
			contents,
			nil,
		)
		if err != nil {
			// Return the error instead of calling log.Fatal.
			log.Printf("Error creating embeddings for batch starting at index %d: %v", i, err)
			return nil, fmt.Errorf("failed to create embeddings for batch starting at index %d: %w", i, err)
		}

		if len(res.Embeddings) != len(textChunk) {
			log.Printf("Embedding count mismatch for batch starting at index %d: expected %d, got %d", i, len(textChunk), len(res.Embeddings))
			return nil, fmt.Errorf("embedding count mismatch for batch starting at %d: expected %d, got %d", i, len(textChunk), len(res.Embeddings))
		}

		for _, e := range res.Embeddings {
			allEmbeddings = append(allEmbeddings, e.Values)
		}
	}

	return allEmbeddings, nil
}
