"use server";

import { revalidateTag } from "next/cache";

import { api } from "@/lib/api";
import { constructNewPath } from "@/lib/utils";
import { IdeaStatus } from "@/types/idea";
import { ReportType } from "@/types/report";

export const generateReport = async (
  type: ReportType,
  ideaId?: string,
  byIdeaStatus?: IdeaStatus
) => {
  if (!ideaId && !byIdeaStatus) {
    console.error("No ideaId or byIdeaStatus provided");
    return null;
  }

  const url = constructNewPath("/dashboard/reports/generate", {
    type,
    ideaId,
    byIdeaStatus,
  });

  try {
    const response = await api.post(url);

    if (!response || !response.ok) {
      console.error(
        "API error generateIdeaReport:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    revalidateTag("reports");

    return data ?? null;
  } catch (error) {
    console.error("Error in getIdea:", error);
    return null;
  }
};
