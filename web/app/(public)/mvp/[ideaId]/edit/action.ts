"use server";

import { api } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

export const updateMVP = async (ideaId: string, htmlContent: string) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  try {
    const response = await api.put(
      `/dashboard/ideas/${ideaId}/mvp`,
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
