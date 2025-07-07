package reddit

type RedditPost struct {
	ID                string  `json:"id"`
	Title             string  `json:"title"`
	Selftext          string  `json:"selftext"`
	Author            string  `json:"author"`
	Score             int     `json:"score"`
	Comments          int     `json:"num_comments"`
	Subreddit         string  `json:"subreddit"`
	Created           float64 `json:"created_utc"`
	URL               string  `json:"url"`
	IsOriginalContent bool    `json:"is_original_content"`
	Permalink         string  `json:"permalink"`
	IsOver18          bool    `json:"over_18"`
	UpvoteRatio       float64 `json:"upvote_ratio"`
}

type ValidationAnalysis struct {
	ValidationScore      float64               `json:"validationScore"`
	MarketAssessment     MarketAssessment      `json:"marketAssessment"`
	ExecutiveSummary     string                `json:"executiveSummary"`
	InsightDensity       InsightDensity        `json:"insightDensity"`
	SubredditAnalysis    SubredditAnalysis     `json:"subredditAnalysis"`
	KeyPatterns          KeyPatterns           `json:"keyPatterns"`
	VoiceOfCustomer      VoiceOfCustomer       `json:"voiceOfCustomer"`
	CompetitiveLandscape CompetitiveLandscape  `json:"competitiveLandscape"`
	EmergingTrends       EmergingTrends        `json:"emergingTrends"`
	StartupOpportunities StartupOpportunities  `json:"startupOpportunities"`
	TopRedditThreads     []RedditThreadSummary `json:"topRedditThreads"`
}

type MarketAssessment struct {
	MarketSize      string   `json:"marketSize"`
	GrowthPotential string   `json:"growthPotential"`
	Competition     string   `json:"competition"`
	Barriers        []string `json:"barriers"`
	Opportunities   []string `json:"opportunities"`
}

type InsightDensity struct {
	TotalPosts     int            `json:"totalPosts"`
	RelevantPosts  int            `json:"relevantPosts"`
	SentimentScore float64        `json:"sentimentScore"`
	ThemeBreakdown map[string]int `json:"themeBreakdown"`
	EngagementRate float64        `json:"engagementRate"`
}

type SubredditAnalysis struct {
	Subreddits []SubredditData `json:"subreddits"`
}

type SubredditData struct {
	Name           string  `json:"name"`
	PostCount      int     `json:"postCount"`
	AvgSentiment   float64 `json:"avgSentiment"`
	EngagementRate float64 `json:"engagementRate"`
	RelevanceScore float64 `json:"relevanceScore"`
}

type KeyPatterns struct {
	PainPoints      []string `json:"painPoints"`
	DesiredFeatures []string `json:"desiredFeatures"`
	UserBehavior    []string `json:"userBehavior"`
	Trends          []string `json:"trends"`
}

type VoiceOfCustomer struct {
	Quotes       []CustomerQuote `json:"quotes"`
	CommonThemes []string        `json:"commonThemes"`
	Sentiment    string          `json:"sentiment"`
}

type CustomerQuote struct {
	Text      string  `json:"text"`
	Author    string  `json:"author"`
	Subreddit string  `json:"subreddit"`
	Score     int     `json:"score"`
	Sentiment float64 `json:"sentiment"`
	URL       string  `json:"url"` // URL to the Reddit post
}

type CompetitiveLandscape struct {
	ExistingTools []Competitor `json:"existingTools"`
	Gaps          []string     `json:"gaps"`
	Opportunities []string     `json:"opportunities"`
}

type Competitor struct {
	Name       string   `json:"name"`
	Sentiment  float64  `json:"sentiment"`
	Strengths  []string `json:"strengths"`
	Weaknesses []string `json:"weaknesses"`
}

type EmergingTrends struct {
	Trends      []Trend  `json:"trends"`
	Predictions []string `json:"predictions"`
}

type Trend struct {
	Name        string  `json:"name"`
	Confidence  float64 `json:"confidence"`
	Description string  `json:"description"`
}

type StartupOpportunities struct {
	Opportunities []Opportunity `json:"opportunities"`
	Positioning   []string      `json:"positioning"`
}

type Opportunity struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Confidence  float64 `json:"confidence"`
	Effort      string  `json:"effort"`
}

type RedditThreadSummary struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	Subreddit string  `json:"subreddit"`
	Score     int     `json:"score"`
	Comments  int     `json:"comments"`
	URL       string  `json:"url"`
	Relevance float64 `json:"relevance"`
}
