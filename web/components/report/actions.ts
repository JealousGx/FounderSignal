"use server";

import { auth } from "@clerk/nextjs/server";

import { api } from "@/lib/api";
import { reportSchema } from "./schema";

export type ReportState = {
  error?: string;
  message?: string;
  fieldErrors?: {
    reason?: string;
  };
};

export const submitReport = async (
  prevState: ReportState | null,
  formData: FormData
): Promise<ReportState> => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to report content." };
  }

  const validatedFields = reportSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: "Validation failed.",
      fieldErrors: {
        reason: validatedFields.error.flatten().fieldErrors.reason?.[0],
      },
    };
  }

  try {
    const response = await api.post(
      "/reports/submit",
      JSON.stringify(validatedFields.data)
    );

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || "Failed to submit report." };
    }

    return { message: "Report submitted successfully. Thank you." };
  } catch (e) {
    console.error("Report submission failed:", e);
    return { error: "An unexpected error occurred." };
  }
};
