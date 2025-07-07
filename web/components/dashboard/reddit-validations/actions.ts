"use server";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

import { api } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";
import { RedditValidation } from "@/types/reddit-validation";

export const generateRedditValidation = async (ideaId: string) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  try {
    const response = await api.post(
      "/dashboard/validations/generate/reddit",
      JSON.stringify({ ideaId })
    );

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error:
          responseData.error ||
          "Failed to generate validation. Please try again.",
      };
    }

    return {
      message: "Validation started successfully!",
      validationId: responseData.validationId,
    };
  } catch (error) {
    console.error("Error generating validation:", error);

    return {
      error: "Failed to generate validation. Please try again.",
    };
  }
};

export const getRedditValidation = cache(
  async (validationId: string): Promise<RedditValidation> => {
    const response = await api.get(`/dashboard/validations/${validationId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch validation");
    }

    return response.json();
  }
);

export const getRedditValidations = cache(
  async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ validations: RedditValidation[]; total: number }> => {
    const url = constructNewPath("/dashboard/validations", params);

    const response = await api.get(url);

    if (!response.ok) {
      throw new Error("Failed to fetch validations");
    }

    return response.json();
  }
);
