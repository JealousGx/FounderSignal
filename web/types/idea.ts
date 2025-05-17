import { AnalyticsDataPoint } from "./analytics";

export interface Idea {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  targetAudience: string;
  status: "active" | "paused" | "completed" | "draft" | "archived";
  stage: "validation" | "mvp" | "ideation";
  signups: number;
  targetSignups: number;
  views: number;
  likes: number;
  dislikes: number;
  engagementRate: number;
  likedByUser: boolean;
  dislikedByUser: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

export interface LandingPage {
  ideaId: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaButtonText: string;
}

export interface IdeaAnalytics {
  ideaId: string;
  idea: Partial<Idea>;
  timeframe: "day" | "week" | "month" | "year";
  startDate: string;
  endDate: string;
  dataPoints: AnalyticsDataPoint[];
  totals: {
    views: number;
    signups: number;
    averageConversionRate: number;
  };
}
