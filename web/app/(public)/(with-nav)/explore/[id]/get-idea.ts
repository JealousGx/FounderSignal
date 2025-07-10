"use server";

import { cache } from "react";

import { api } from "@/lib/api";
import { Idea } from "@/types/idea";

type IdeaExtended = Idea & {
  founder: {
    name: string;
    image: string;
  };
  stats: {
    signups: number;
    conversionRate: number;
    avgTimeOnPage: string;
    bounceRate: number;
  };
  feedbackHighlights: string[];
};

export const getIdea = cache(async (id: string) => {
  try {
    const response = await api.get(`/ideas/${id}`, {
      next: {
        revalidate: 3600,
        tags: [`idea-${id}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching idea:",
        response.status,
        response.statusText
      );

      return null;
    }

    const jsonRes = await response.json();

    return {
      idea: jsonRes.idea as IdeaExtended,
      relatedIdeas: jsonRes.relatedIdeas as Partial<Idea>[],
    };
  } catch (error) {
    console.error("Error in getIdea:", error);
    return null;
  }
});
