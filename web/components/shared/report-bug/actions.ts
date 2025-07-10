"use server";

import { api } from "@/lib/api";
import { bugReportSchema } from "./schema";

export type BugReportState = {
  error?: string;
  message?: string;
  fieldErrors?: {
    description?: string;
    stepsToReproduce?: string;
  };
};

export const submitBugReport = async (
  prevState: BugReportState | null,
  formData: FormData
): Promise<BugReportState> => {
  const validatedFields = bugReportSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: "Validation failed.",
      fieldErrors: {
        description: fieldErrors.description?.[0],
        stepsToReproduce: fieldErrors.stepsToReproduce?.[0],
      },
    };
  }

  try {
    const response = await api.post(
      "/reports/bug",
      JSON.stringify(validatedFields.data)
    );

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || "Failed to submit bug report." };
    }

    return { message: "Bug report submitted successfully. Thank you!" };
  } catch (e) {
    console.error("Bug report submission failed:", e);
    return { error: "An unexpected error occurred." };
  }
};
