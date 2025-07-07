package prompts

import "fmt"

func BuildAnalysisPrompt(ideaTitle, ideaDescription, postsData string) string {
	return fmt.Sprintf(`
You are an expert market researcher and startup analyst. Analyze the following Reddit data for the idea: "%s" - %s

Reddit Data:
%s

Provide a comprehensive analysis in the following JSON format:
{
  "validationScore": 85.5,
  "marketAssessment": {
    "marketSize": "Large market with $X billion potential",
    "growthPotential": "High growth potential due to...",
    "competition": "Moderate competition with room for differentiation",
    "barriers": ["Barrier 1", "Barrier 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  },
  "executiveSummary": "A concise 2-3 sentence summary of key findings",
  "insightDensity": {
    "totalPosts": 150,
    "relevantPosts": 120,
    "sentimentScore": 0.75,
    "themeBreakdown": {"pain points": 45, "feature requests": 30, "general discussion": 25},
    "engagementRate": 0.68
  },
  "subredditAnalysis": {
    "subreddits": [
      {
        "name": "startups",
        "postCount": 50,
        "avgSentiment": 0.8,
        "engagementRate": 0.75,
        "relevanceScore": 0.9
      }
    ]
  },
  "keyPatterns": {
    "painPoints": ["Pain point 1", "Pain point 2"],
    "desiredFeatures": ["Feature 1", "Feature 2"],
    "userBehavior": ["Behavior 1", "Behavior 2"],
    "trends": ["Trend 1", "Trend 2"]
  },
  "voiceOfCustomer": {
    "quotes": [
      {
        "text": "I really need a tool that...",
        "author": "user123",
        "subreddit": "startups",
        "score": 25,
        "sentiment": 0.9,
        "url": "https://reddit.com/r/startups/comments/post_id"
      }
    ],
    "commonThemes": ["Theme 1", "Theme 2"],
    "sentiment": "overwhelmingly positive"
  },
  "competitiveLandscape": {
    "existingTools": [
      {
        "name": "Tool A",
        "sentiment": 0.6,
        "strengths": ["Strength 1"],
        "weaknesses": ["Weakness 1"]
      }
    ],
    "gaps": ["Gap 1", "Gap 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  },
  "emergingTrends": {
    "trends": [
      {
        "name": "Trend Name",
        "confidence": 0.85,
        "description": "Description of the trend"
      }
    ],
    "predictions": ["Prediction 1", "Prediction 2"]
  },
  "startupOpportunities": {
    "opportunities": [
      {
        "title": "Opportunity Title",
        "description": "Description",
        "confidence": 0.8,
        "effort": "medium"
      }
    ],
    "positioning": ["Positioning 1", "Positioning 2"]
  },
  "topRedditThreads": [
    {
      "id": "post_id",
      "title": "Thread Title",
      "subreddit": "startups",
      "score": 150,
      "comments": 45,
      "url": "https://reddit.com/...",
      "relevance": 0.95
    }
  ]
}

Focus on providing actionable insights and specific data points. Use the most recent data. The validation score should be 0-100 based on market demand, competition, and user sentiment.
The reddit url should be as specific as possible, including the post ID and subreddit name. The customer will be able to click on the URL to view the post directly. If the post is deleted or removed, or is not related, skip it and do not include it in the analysis. Do not play with the urls, just use the exact URL from Reddit.
`, ideaTitle, ideaDescription, postsData)
}
