package reddit

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/vartanbeno/go-reddit/v2/reddit"
)

var (
	redditClient *reddit.Client
	once         sync.Once
)

type RedditClient struct {
	client *reddit.Client
}

// NewClient initializes the Reddit client as a singleton.
func NewClient() *RedditClient {
	once.Do(func() {
		redditClient, _ = reddit.NewReadonlyClient()
	})

	fmt.Println("Reddit client initialized")

	return &RedditClient{client: redditClient}
}

// SearchPosts performs a search on Reddit for a given query and returns relevant posts.
// It filters out deleted, removed, or low-quality posts.
func (r *RedditClient) SearchPosts(ctx context.Context, query string, subreddits []string, limit int) ([]RedditPost, error) {

	var allPosts []RedditPost

	// Search in each subreddit individually since the library doesn't support multi-subreddit search
	for _, subreddit := range subreddits {
		posts, _, err := r.client.Subreddit.NewPosts(ctx, subreddit, &reddit.ListOptions{
			Limit: limit,
		})
		if err != nil {
			// Log error but continue with other subreddits
			fmt.Printf("Error fetching posts from r/%s: %v\n", subreddit, err)
			continue
		}

		// Filter posts based on query relevance
		for _, post := range posts {
			if isRelevantPost(post, query) {
				// Perform checks to ensure the post is valid and high-quality
				if post.Author == "[deleted]" || post.Body == "[removed]" || post.URL == "" {
					continue
				}
				if post.Body == "" && post.NumberOfComments == 0 {
					continue
				}

				allPosts = append(allPosts, RedditPost{
					ID:          post.ID,
					Title:       post.Title,
					Selftext:    post.Body,
					URL:         post.URL,
					Permalink:   post.Permalink,
					Score:       post.Score,
					Comments:    post.NumberOfComments,
					Subreddit:   post.SubredditName,
					Author:      post.Author,
					Created:     float64(post.Created.Unix()),
					IsOver18:    post.NSFW,
					UpvoteRatio: float64(post.UpvoteRatio),
				})
			}
		}
	}

	return allPosts, nil
}

// isRelevantPost checks if a post is relevant to the given query
func isRelevantPost(post *reddit.Post, query string) bool {
	queryLower := strings.ToLower(query)
	titleLower := strings.ToLower(post.Title)
	contentLower := strings.ToLower(post.Body)

	// Check if query terms appear in title or content
	queryTerms := strings.Fields(queryLower)
	for _, term := range queryTerms {
		if len(term) < 3 { // Skip very short terms
			continue
		}
		if strings.Contains(titleLower, term) || strings.Contains(contentLower, term) {
			return true
		}
	}

	return false
}

// // GetSubredditPosts gets posts from a specific subreddit
// func GetSubredditPosts(ctx context.Context, subreddit string, limit int) ([]RedditPost, error) {
// 	client, err := NewClient()
// 	if err != nil {
// 		return nil, err
// 	}

// 	posts, _, err := client.Subreddit.NewPosts(ctx, subreddit, &reddit.ListOptions{
// 		Limit: limit,
// 	})
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get posts from r/%s: %w", subreddit, err)
// 	}

// 	var redditPosts []RedditPost
// 	for _, post := range posts {
// 		// Filter out low-quality posts
// 		if post.Author == "[deleted]" || post.Body == "[removed]" {
// 			continue
// 		}

// 		redditPosts = append(redditPosts, RedditPost{
// 			ID:          post.ID,
// 			Title:       post.Title,
// 			Selftext:    post.Body, // Use Body instead of SelfText
// 			URL:         post.URL,
// 			Permalink:   post.Permalink,
// 			Score:       post.Score,
// 			Comments:    post.NumberOfComments,
// 			Subreddit:   post.SubredditName,
// 			Author:      post.Author,
// 			Created:     float64(post.Created.Unix()),
// 			IsOver18:    post.NSFW,
// 			UpvoteRatio: float64(post.UpvoteRatio),
// 		})
// 	}

// 	return redditPosts, nil
// }

// // SearchSubreddit searches for posts in a specific subreddit
// func SearchSubreddit(ctx context.Context, subreddit, query string, limit int) ([]RedditPost, error) {
// 	client, err := NewClient()
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Use the subreddit search endpoint
// 	posts, _, err := client.Subreddit.SearchPosts(ctx, subreddit, query, &reddit.ListPostSearchOptions{
// 		ListPostOptions: reddit.ListPostOptions{
// 			ListOptions: reddit.ListOptions{
// 				Limit: limit,
// 			},
// 		},
// 	})
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to search r/%s for '%s': %w", subreddit, query, err)
// 	}

// 	var redditPosts []RedditPost
// 	for _, post := range posts {
// 		// Filter out low-quality posts
// 		if post.Author == "[deleted]" || post.Body == "[removed]" {
// 			continue
// 		}

// 		redditPosts = append(redditPosts, RedditPost{
// 			ID:          post.ID,
// 			Title:       post.Title,
// 			Selftext:    post.Body, // Use Body instead of SelfText
// 			URL:         post.URL,
// 			Permalink:   post.Permalink,
// 			Score:       post.Score,
// 			Comments:    post.NumberOfComments,
// 			Subreddit:   post.SubredditName,
// 			Author:      post.Author,
// 			Created:     float64(post.Created.Unix()),
// 			IsOver18:    post.NSFW,
// 			UpvoteRatio: float64(post.UpvoteRatio),
// 		})
// 	}

// 	return redditPosts, nil
// }
