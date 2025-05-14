"use server";

import { api } from "@/lib/api";
import { Activity } from "@/types/activity";

export const getInitialActivity = async (
  maxActivities = 5
): Promise<Activity[]> => {
  try {
    const response = await api.get("/dashboard/recent-activity", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Failed to get initial activities:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();

    return (data || []).slice(0, maxActivities);
  } catch (error) {
    console.error("Error getting initial activities:", error);

    return [];
  }
};
