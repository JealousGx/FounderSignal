"use server";

import { cache } from "react";

import { api } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";
import { RedditValidation } from "@/types/reddit-validation";

export const generateRedditValidation = async (
  ideaId: string
): Promise<{ validationId: string }> => {
  const response = await api.post(
    "/dashboard/validations/generate/reddit",
    JSON.stringify({ ideaId })
  );

  if (!response.ok) {
    throw new Error("Failed to generate validation");
  }

  return response.json();
};

export const getRedditValidation = cache(
  async (validationId: string): Promise<RedditValidation> => {
    const response = await api.get(`/dashboard/validations/${validationId}`);

    console.error("Fetching Reddit validation:", response);

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
