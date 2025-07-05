"use server";

import { api } from "@/lib/api";
import { cache } from "react";

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
      cache: "force-cache",
      next: {
        revalidate: 3600,
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

    return data;
  } catch (error) {
    console.error("Error in getMVP:", error);
    return null;
  }
});
