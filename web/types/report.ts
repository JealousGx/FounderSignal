export interface Report {
  id: string;
  ideaId: string;
  ideaTitle: string;
  date: string;
  type: "Weekly" | "Monthly" | "Milestone" | "Final";
  views: number;
  signups: number;
  conversionRate: number;
  validated: boolean;
  sentiment: number;
}
