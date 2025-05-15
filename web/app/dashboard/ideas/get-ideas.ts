"use server";

import { cache } from "react";

import { api, QueryParams } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";

export const getUserIdeas = cache(
  async (getStats: boolean = false, qs: QueryParams) => {
    try {
      const url = constructNewPath("/dashboard/ideas/user", {
        ...qs,
        getStats,
      });

      const response = await api.get(url, {
        next: {
          revalidate: 3600,
          tags: [`ideas`],
        },
      });

      if (!response.ok) {
        console.error(
          "API error fetching getUserIdeas:",
          response.status,
          response.statusText
        );

        return null;
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error in getUserIdeas:", error);
      return null;
    }
  }
);
