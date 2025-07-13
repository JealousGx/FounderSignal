"use server";

import { cache } from "react";

import { staticApi } from "@/lib/static-api";
import { RedditValidation } from "@/types/reddit-validation";

export const getRedditValidationSample = cache(async () => {
  try {
    const response = await staticApi("/samples/reddit-validation", {
      next: {
        revalidate: Infinity,
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

    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type");

    if (
      contentLength === "0" ||
      (contentType && !contentType.includes("application/json"))
    ) {
      const data = await response.text();

      console.warn(
        `Received a response with content-length ${contentLength} and content-type ${contentType}. Data: ${data}`
      );

      return null;
    }

    const data = await response.json();

    return data as RedditValidation | null;
  } catch (error) {
    console.error("Error in getRedditValidationSample:", error);
    return null;
  }
});
