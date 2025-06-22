"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { api } from "@/lib/api";
import { deleteFile } from "@/lib/r2";

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
