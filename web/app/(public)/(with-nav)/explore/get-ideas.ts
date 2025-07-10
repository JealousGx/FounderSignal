"use server";

import { cache } from "react";

import { api, QueryParams } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";
import { Idea } from "@/types/idea";

export const getIdeas = cache(async (qs: QueryParams) => {
  try {
    const url = constructNewPath("/ideas", qs);
    const response = await api.get(url, {
      next: {
        revalidate: 3600,
        tags: [`ideas`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching more ideas (from action):",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    return {
      ideas: data.ideas as Idea[],
      totalCount: data.total || 0,
    };
  } catch (error) {
    console.error("Error in getIdeas:", error);
    return null;
  }
});
