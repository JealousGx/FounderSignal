"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { formSchema } from "./schema";

import { api } from "@/lib/api";
import { revalidateCfCacheBatch } from "@/lib/cloudflare/cache";

type FieldError = Partial<Record<keyof z.infer<typeof formSchema>, string>>;

export type SubmitIdeaState = {
  message?: string;
  error?: string;
  fieldErrors?: FieldError;
  ideaId?: string;
  mvpId?: string;
};

export const submitIdea = async (
  prevState: SubmitIdeaState | null,
  formData: FormData
): Promise<SubmitIdeaState> => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to submit an idea." };
  }

  const rawFormData = Object.fromEntries(formData);

  const validatedFields = formSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: FieldError = {};
    for (const issue of validatedFields.error.issues) {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof z.infer<typeof formSchema>] =
          issue.message;
      }
    }
    return {
      error: "Validation failed. Please check the form fields.",
      fieldErrors: fieldErrors,
    };
  }

  const idea = validatedFields.data;

  try {
    const response = await api.post(
      "/dashboard/ideas",
      JSON.stringify({
        ...idea,
        forceNew: idea.forceNew === "true",
      })
    );
    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error: responseData.error || "Failed to submit idea. Please try again.",
      };
    }

    revalidateTag("ideas");
    await revalidateCfCacheBatch({
      api: [`/ideas/`],
      web: [`/explore`],
    });

    console.log(
      `Idea ${idea.title} by ${user.userId} submitted successfully:`,
      responseData
    );

    return {
      message: `Idea "${idea.title}" submitted successfully!`,
      ideaId: responseData.id,
      mvpId: responseData.mvpId,
    };
  } catch (e: unknown) {
    console.error("Submission failed:", e);

    return {
      error:
        (e as Error).message ||
        "An unexpected error occurred during submission.",
    };
  }
};
