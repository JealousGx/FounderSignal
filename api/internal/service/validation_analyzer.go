package service

import (
	"context"
	"encoding/json"
	"fmt"
	"foundersignal/internal/pkg/prompts"
	"foundersignal/internal/pkg/reddit"
	"math"
	"sort"
	"strings"
	"time"
)

type ValidationAnalyzer struct {
	aiService AIService
}

func NewValidationAnalyzer(aiService AIService) *ValidationAnalyzer {
	return &ValidationAnalyzer{
		aiService: aiService,
	}
}

type relevantPost struct {
	Post       reddit.RedditPost
	Similarity float64
}

func (va *ValidationAnalyzer) AnalyzeRedditData(ctx context.Context, ideaTitle, ideaDescription string, redditPosts []reddit.RedditPost) (*reddit.ValidationAnalysis, error) {
	// 1. Create embeddings for the idea and all Reddit posts.
	ideaText := ideaTitle + "\n" + ideaDescription
	postTexts := make([]string, len(redditPosts))
	for i, post := range redditPosts {
		postTexts[i] = post.Title + "\n" + post.Selftext
	}

	allTexts := append([]string{ideaText}, postTexts...)
	embeddings, err := va.aiService.CreateEmbeddings(ctx, allTexts)
	if err != nil {
		return nil, fmt.Errorf("failed to create embeddings: %w", err)
	}

	ideaEmbedding := embeddings[0]
	postEmbeddings := embeddings[1:]

	// 2. Find the most relevant posts using cosine similarity.
	var relevantPosts []relevantPost
	for i, post := range redditPosts {
		similarity, err := cosineSimilarity(ideaEmbedding, postEmbeddings[i])
		if err != nil {
			// Skip posts that can't be compared
			continue
		}
		relevantPosts = append(relevantPosts, relevantPost{Post: post, Similarity: similarity})
	}

	// Sort posts by similarity score in descending order.
	sort.Slice(relevantPosts, func(i, j int) bool {
		return relevantPosts[i].Similarity > relevantPosts[j].Similarity
	})

	// 3. Select the top N most relevant posts to include in the prompt.
	const topN = 10
	numPostsToInclude := topN
	if len(relevantPosts) < topN {
		numPostsToInclude = len(relevantPosts)
	}

	topPosts := make([]reddit.RedditPost, numPostsToInclude)
	for i := 0; i < numPostsToInclude; i++ {
		topPosts[i] = relevantPosts[i].Post
	}

	// Prepare data from only the most relevant posts for AI analysis
	postsData := preparePostsForAnalysis(topPosts)

	// Generate comprehensive analysis using AI
	prompt := prompts.BuildAnalysisPrompt(ideaTitle, ideaDescription, postsData)

	response, err := va.aiService.Generate(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to generate analysis: %w", err)
	}

	// Parse AI response
	var analysis reddit.ValidationAnalysis
	if err := json.Unmarshal([]byte(response), &analysis); err != nil {
		// Attempt to clean the response if it's wrapped in markdown
		cleanedResponse := strings.TrimPrefix(response, "```json\n")
		cleanedResponse = strings.TrimSuffix(cleanedResponse, "\n```")
		if err := json.Unmarshal([]byte(cleanedResponse), &analysis); err != nil {
			return nil, fmt.Errorf("failed to parse AI response: %w", err)
		}
	}

	return &analysis, nil
}

func preparePostsForAnalysis(posts []reddit.RedditPost) string {
	var sb strings.Builder
	for _, post := range posts {
		sb.WriteString(fmt.Sprintf("Subreddit: r/%s\n", post.Subreddit))
		sb.WriteString(fmt.Sprintf("Title: %s\n", post.Title))
		sb.WriteString(fmt.Sprintf("Content: %s\n", post.Selftext))
		sb.WriteString(fmt.Sprintf("Score: %d, Comments: %d\n", post.Score, post.Comments))
		sb.WriteString(fmt.Sprintf("URL: %s\n", post.URL))
		sb.WriteString(fmt.Sprintf("Author: %s\n", post.Author))
		sb.WriteString(fmt.Sprintf("Created: %s\n", time.Unix(int64(post.Created), 0).Format(time.RFC3339)))
		sb.WriteString(fmt.Sprintf("Permalink: %s\n", post.Permalink))
		sb.WriteString(fmt.Sprintf("IsOver18: %t\n", post.IsOver18))
		sb.WriteString(fmt.Sprintf("UpvoteRatio: %.2f\n", post.UpvoteRatio))
		sb.WriteString("---\n")
	}
	return sb.String()
}

// cosineSimilarity calculates the cosine similarity between two vectors.
func cosineSimilarity(a, b []float32) (float64, error) {
	if len(a) != len(b) {
		return 0, fmt.Errorf("vectors must have the same length")
	}

	var dotProduct float64
	var normA float64
	var normB float64

	for i := 0; i < len(a); i++ {
		dotProduct += float64(a[i] * b[i])
		normA += float64(a[i] * a[i])
		normB += float64(b[i] * b[i])
	}

	if normA == 0 || normB == 0 {
		return 0, nil // Return 0 similarity for zero vectors
	}

	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB)), nil
}
