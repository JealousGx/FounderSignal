import { Idea } from "./idea";

export interface AudienceStats {
  totalMembers: number;
  conversionRate: number;
  totalSubscribers: number;
  newSubscribers: number;
  newSubscribersChange: number;
  averageConversionRate: number;
  conversionRateChange: number;
  activeIdeas: number;
}

export interface AudienceMember {
  userId: string;
  email: string;
  name?: string;
  signupTime: string;
  ideaId: string; // Which idea they signed up for
  idea?: Partial<Idea>;
  engaged: boolean;
  converted: boolean; // Whether they signed up for the idea
  // Optional tracking data
  lastActive?: string;
  visits?: number;
}
