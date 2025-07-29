"use server";

import { revalidateTag } from "next/cache";
import { cache } from "react";

import { api } from "@/lib/api";
import { revalidateCfCacheBatch } from "@/lib/cloudflare/cache";

export async function sendSignal(
  ideaId: string,
  mvpId: string | null | undefined,
  eventType: string,
  metadata?: { [key: string]: unknown }
): Promise<void> {
  try {
    await api.post(
      `/ideas/${ideaId}/mvp/${mvpId}/signals`,
      JSON.stringify({ eventType, metadata })
    );
    console.log(`Signal '${eventType}' sent for idea ${ideaId}`, metadata);

    revalidateTag(`idea-${ideaId}`);
    await revalidateCfCacheBatch({
      api: [`/ideas/${ideaId}`],
      web: [`/explore/${ideaId}`],
    });
  } catch (error) {
    console.error("Error in sendSignal:", error);
  }
}

export const getMVP = cache(async (ideaId: string, mvpId?: string | null) => {
  try {
    let url = `/ideas/${ideaId}/mvp`;

    if (mvpId) {
      url = `/dashboard/ideas/${ideaId}/mvp/${mvpId}`;
    }

    const response = await api.get(url, {
      next: {
        tags: [`mvp-${ideaId}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching mvp:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    if (data?.htmlUrl) {
      try {
        const response = await fetch(data.htmlUrl, {
          headers: {
            "Content-Type": "text/html",
          },
          next: {
            tags: [`mvp-${ideaId}`], // Cache tag for revalidation
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.text();

        data.htmlContent = content;
      } catch (error) {
        console.error("Failed to fetch HTML content:", error);
        data.htmlContent = undefined;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in getMVP:", error);
    return null;
  }
});
