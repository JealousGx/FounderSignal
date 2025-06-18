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
  isPrivate: boolean;
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

export type IdeaStatus =
  | "active"
  | "paused"
  | "completed"
  | "draft"
  | "archived";
