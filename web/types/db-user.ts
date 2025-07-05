export interface DBUser {
  id: string;
  email: string;
  plan: "starter" | "pro" | "business";
  ideaLimit: number;
  usedFreeTrial: boolean;
  isPaying: boolean;
  activeIdeaCount: number;
  createdAt: string;
  updatedAt: string;
}
