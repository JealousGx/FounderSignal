import { Idea } from "./idea";

export interface Report {
  id: string;
  ideaId: string;
  idea?: Partial<Idea>;
  date: string;
  type: ReportType;
  views: number;
  signups: number;
  conversionRate: number;
  engagementRate: number;
  validated: boolean;
  sentiment: number;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = "weekly" | "monthly" | "milestone" | "final";
