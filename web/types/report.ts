import { Idea } from "./idea";

export interface Report {
  id: string;
  ideaId: string;
  idea?: Partial<Idea>;
  date: string;
  type: "Weekly" | "Monthly" | "Milestone" | "Final";
  views: number;
  signups: number;
  conversionRate: number;
  validated: boolean;
  sentiment: number;
  engagedUsers?: number;
  engagementRate?: number;
  createdAt: string;
  updatedAt: string;
}
