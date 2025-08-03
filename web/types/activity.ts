export type ActivityType =
  | "cta_click"
  | "pageview"
  | "scroll_depth"
  | "time_on_page"
  | "comment"
  | "like"
  | "dislike"
  | "reaction"
  | "content_reported"
  | "error"
  | "mvp_generated";

export type Activity = {
  id: string;
  ideaId: string;
  ideaTitle: string;
  type: ActivityType;
  message: string;
  referenceUrl?: string;
  timestamp: string;
};
