"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { getLandingPagePromptTemplate } from "@/constants/prompts/landing-page";
import { api } from "@/lib/api";
import {
  revalidateAPICfCache,
  revalidateCfCache,
} from "@/lib/cloudflare/cache";
import { deleteFile, getSignedUrlForUpload } from "@/lib/cloudflare/r2";

export const updateMVP = async (
  ideaId: string,
  mvpId: string | null,
  htmlContent: string,
  mvpName?: string
) => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to update an idea." };
  }

  const htmlPutSignedUrl = await getSignedUrlForUpload(
    `${ideaId}/mvp/${mvpId}`,
    "text/html"
  );

  if (!htmlPutSignedUrl) {
    return { error: "Failed to get signed URL for HTML upload." };
  }

  try {
    const htmlUploadResponse = await fetch(htmlPutSignedUrl.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/html",
      },
      body: htmlContent,
    });

    if (!htmlUploadResponse.ok) {
      console.error(
        "Failed to upload HTML content:",
        htmlUploadResponse.statusText
      );
      return { error: "Failed to upload HTML content." };
    }

    const htmlUrl = `${process.env.NEXT_PUBLIC_R2_ENDPOINT}/${htmlPutSignedUrl.key}`;

    const response = await api.put(
      `/dashboard/ideas/${ideaId}/mvp${mvpId ? `/${mvpId}` : ""}`,
      JSON.stringify({ htmlUrl, name: mvpName })
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
    await Promise.all([
      revalidateCfCache(`/mvp/${ideaId}`),
      revalidateAPICfCache(`/ideas/${ideaId}/mvp`),
    ]);

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
  mvpId: string | null,
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
    title,
    description,
    ctaBtnText,
    instructions
  );

  try {
    const response = await api.post(
      "/dashboard/ai/generate/landing-page",
      JSON.stringify({ prompt, mvpId, ideaId })
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
