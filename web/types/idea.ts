export interface Idea {
  id: string;
  title: string;
  description: string;
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
