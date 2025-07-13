"use server";

import { cache } from "react";

import { staticApi } from "@/lib/static-api";
import { RedditValidation } from "@/types/reddit-validation";

export const getRedditValidationSample = cache(async () => {
  try {
    const response = await staticApi("/samples/reddit-validation", {
      next: {
        revalidate: 31536000, // 1 year
      },
    });

    if (!response.ok) {
      console.error(
        "API error in getRedditValidationSample:",
        response.status,
        response.statusText
      );

      return null;
    }

    console.log("Response from getRedditValidationSample:", response);

    const data = await response.json();

    return data as RedditValidation | null;
  } catch (error) {
    console.error("Error in getRedditValidationSample:", error);
    return null;
  }
});
