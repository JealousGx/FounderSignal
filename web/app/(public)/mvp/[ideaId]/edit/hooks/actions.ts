"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { getLandingPagePromptTemplate } from "@/constants/prompts/landing-page";
import { api } from "@/lib/api";
import { deleteFile } from "@/lib/r2";

export const createMVP = async (
  ideaId: string,
  name: string,
  htmlContent: string
) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  try {
    const response = await api.post(
      `/dashboard/ideas/${ideaId}/mvp`,
      JSON.stringify({ htmlContent, name })
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
          "Failed to create landing page. Please try again.",
      };
    }

    revalidateTag(`idea-${ideaId}`);

    return {
      message: `Landing page created successfully!`,
      mvpId: responseData.mvpId,
    };
  } catch (err) {
    console.log("Error creating MVP", err);

    return {
      error: "Error creating MVP",
    };
  }
};

export const updateMVP = async (
  ideaId: string,
  mvpId: string | null,
  htmlContent: string
) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  try {
    const response = await api.put(
      `/dashboard/ideas/${ideaId}/mvp${mvpId ? `/${mvpId}` : ""}`,
      JSON.stringify({ htmlContent })
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
          "Failed to update landing page. Please try again.",
      };
    }

    revalidateTag(`mvp-${ideaId}`);

    return {
      message: `Landing page updated successfully!`,
    };
  } catch (err) {
    console.log("Error updating MVP", err);

    return {
      error: "Error updating MVP",
    };
  }
};

export const deleteAsset = async (fileName: string) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to delete assets." };
  }

  try {
    await deleteFile(fileName);
    return {
      message: "Asset deleted successfully!",
    };
  } catch (err) {
    console.log("Error deleting asset", err);

    return {
      error: "Error deleting asset",
    };
  }
};

export const generateMVPWithAI = async (
  ideaId: string,
  title: string,
  description: string,
  ctaBtnText = "Get Early Access",
  instructions?: string
) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to generate with AI." };
  }

  const prompt = getLandingPagePromptTemplate(
    ideaId,
    title,
    description,
    ctaBtnText,
    instructions
  );

  try {
    const response = await api.post(
      "/dashboard/ai/generate",
      JSON.stringify({ prompt })
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
          "Failed to generate landing page. Please try again.",
      };
    }

    return {
      htmlContent: responseData.response,
      message: "Landing page generated successfully!",
    };
  } catch (err) {
    console.error("Error generating MVP with AI", err);
    return {
      error: "Failed to generate landing page. Please try again.",
    };
  }
};
