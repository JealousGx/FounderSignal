"use server";

import { cache } from "react";

import { api, QueryParams } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";

export const getReports = cache(
  async (getStats: boolean = false, qs?: QueryParams) => {
    try {
      const url = constructNewPath("/dashboard/reports", {
        ...qs,
        getStats,
      });

      const response = await api.get(url, {
        next: {
          revalidate: 3600,
          tags: [`reports`],
        },
      });

      if (!response.ok) {
        console.error(
          "API error fetching getReports:",
          response.status,
          response.statusText
        );

        return null;
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error in getReports:", error);
      return null;
    }
  }
);
