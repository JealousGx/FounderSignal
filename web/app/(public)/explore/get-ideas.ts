"use server";

import { api } from "@/lib/api";
import { Idea } from "@/types/idea";

export async function getIdeas(limit: number, offset: number) {
  try {
    // api.get internally uses customFetch which is a Server Action.
    // This is fine because fetchMoreIdeasAction is also a Server Action.
    const response = await api.get(`/ideas?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      console.error(
        "API error fetching more ideas (from action):",
        response.status,
        response.statusText
      );
      // Consider how you want to propagate errors to the client.
      // Returning null is one option, or throwing an error that the client can catch.
      return null;
    }
    const data = await response.json();
    return {
      ideas: data.ideas as Idea[],
      totalCount: data.total || 0,
    };
  } catch (error) {
    console.error("Error in fetchMoreIdeasAction:", error);
    // Propagate error or return null
    return null;
  }
}
