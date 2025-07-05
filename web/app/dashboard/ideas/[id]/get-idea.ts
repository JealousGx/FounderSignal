"use server";

import { cache } from "react";

import { api } from "@/lib/api";

export const getIdea = cache(
  async (
    id: string,
    { withAnalytics, withMVPs }: { withAnalytics?: boolean; withMVPs?: boolean }
  ) => {
    try {
      const response = await api.get(
        `/dashboard/ideas/user/${id}?withAnalytics=${withAnalytics}&withMVPs=${withMVPs}`,
        {
          next: {
            revalidate: 3600,
            tags: [`idea-${id}`],
          },
        }
      );

      if (!response.ok) {
        console.error(
          "API error fetching getIdea:",
          response.status,
          response.statusText
        );

        return null;
      }

      const data = await response.json();

      return data ?? null;
    } catch (error) {
      console.error("Error in getIdea:", error);
      return null;
    }
  }
);
