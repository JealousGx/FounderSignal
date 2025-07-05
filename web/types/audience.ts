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
  mvpId: string; // The MVP they are associated with
  idea?: Partial<Idea>;
  engaged: boolean;
  converted: boolean; // Whether they signed up for the idea
  // Optional tracking data
  lastActive?: string;
  visits?: number;
}
