"use server";

import { api } from "@/lib/api";
import { Idea } from "@/types/idea";
import { cache } from "react";

export const getIdeas = cache(async (limit: number, offset: number) => {
  try {
    const response = await api.get(`/ideas?limit=${limit}&offset=${offset}`, {
      cache: "force-cache",
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
