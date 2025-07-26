"use server";

import { cache } from "react";

import { api, QueryParams } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";

export const getAudience = cache(
  async (getStats: boolean = false, qs?: QueryParams) => {
    try {
      const url = constructNewPath("/dashboard/audience", { ...qs, getStats });
      const response = await api.get(url, {
        next: {
          revalidate: 3600,
          tags: [`audience`],
        },
      });

      if (!response.ok) {
        console.error(
          "API error fetching getAudience:",
          response.status,
          response.statusText
        );

        return null;
      }

      const data = await response.json();

      if (!data || !data.audiences || data.audiences.length === 0) {
        console.error("No audience data found");
        return null;
      }

      return {
        ...data,
        audiences: toUI(data.audiences),
      };
    } catch (error) {
      console.error("Error in getAudience:", error);
      return null;
    }
  }
);

const toUI = (audiences: Record<string, string>[]) => {
  return audiences.map((audience) => {
    return {
      ...audience,
      idea: {
        id: audience.ideaId,
        title: audience.ideaTitle,
      },
    };
  });
};
