export interface RedditValidation {
  id: string;
  ideaId: string;
  ideaTitle: string;
  status: "processing" | "completed" | "failed";
  validationScore: number;
  executiveSummary: string;
  processedAt: string | null;
  error?: string;

  // JSON fields
  marketAssessment: MarketAssessment | null;
  insightDensity: InsightDensity | null;
  subredditAnalysis: SubredditAnalysis | null;
  keyPatterns: KeyPatterns | null;
  voiceOfCustomer: VoiceOfCustomer | null;
  competitiveLandscape: CompetitiveLandscape | null;
  emergingTrends: EmergingTrends | null;
  startupOpportunities: StartupOpportunities | null;
  topRedditThreads: RedditThreadSummary[] | null;
}

export interface MarketAssessment {
  marketSize: string;
  growthPotential: string;
  competition: string;
  barriers: string[];
  opportunities: string[];
}

export interface InsightDensity {
  totalPosts: number;
  relevantPosts: number;
  sentimentScore: number;
  themeBreakdown: Record<string, number>;
  engagementRate: number;
}

export interface SubredditAnalysis {
  subreddits: SubredditData[];
}

export interface SubredditData {
  name: string;
  postCount: number;
  avgSentiment: number;
  engagementRate: number;
  relevanceScore: number;
}

export interface KeyPatterns {
  painPoints: string[];
  desiredFeatures: string[];
  userBehavior: string[];
  trends: string[];
}

export interface VoiceOfCustomer {
  quotes: CustomerQuote[];
  commonThemes: string[];
  sentiment: string;
}

export interface CustomerQuote {
  text: string;
  author: string;
  subreddit: string;
  score: number;
  sentiment: number;
  url: string; // Direct link to the Reddit post
}

export interface CompetitiveLandscape {
  existingTools: Competitor[];
  gaps: string[];
  opportunities: string[];
}

export interface Competitor {
  name: string;
  sentiment: number;
  strengths: string[];
  weaknesses: string[];
}

export interface EmergingTrends {
  trends: Trend[];
  predictions: string[];
}

export interface Trend {
  name: string;
  confidence: number;
  description: string;
}

export interface StartupOpportunities {
  opportunities: Opportunity[];
  positioning: string[];
}

export interface Opportunity {
  title: string;
  description: string;
  confidence: number;
  effort: string;
}

export interface RedditThreadSummary {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  comments: number;
  url: string;
  relevance: number;
}
