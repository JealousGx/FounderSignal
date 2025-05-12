"use server";

import { api } from "@/lib/api";

export async function sendSignal(
  ideaId: string,
  eventType: string,
  metadata?: any
): Promise<void> {
  try {
    await api.post(
      `/ideas/${ideaId}/signals`,
      JSON.stringify({ eventType, metadata })
    );
    console.log(`Signal '${eventType}' sent for idea ${ideaId}`, metadata);
  } catch (error) {
    console.error("Error in sendSignal:", error);
  }
}
