import { AnalyticsDataPoint } from "./analytics";

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAudience: string;
  status: "Active" | "Paused" | "Completed" | "Draft";
  stage: "Validation" | "MVP" | "Ideation";
  signups: number;
  targetSignups: number;
  views: number;
  engagementRate: number;
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
