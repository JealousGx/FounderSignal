"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { formSchema } from "./schema";

import { getLandingPagePromptTemplate } from "@/constants/prompts/landing-page";
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

    if (responseData.id && responseData.mvpId) {
      const mvpResponse = await generateAndSaveMVP(
        responseData.id,
        responseData.mvpId,
        idea.title,
        idea.description,
        idea.ctaButtonText
      );

      if (mvpResponse.error) {
        console.error("MVP Generation Error:", mvpResponse.error);

        return {
          error: mvpResponse.error,
          ideaId: responseData.id,
          mvpId: responseData.mvpId,
        };
      }
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

const generateAndSaveMVP = async (
  ideaId: string,
  mvpId: string,
  metaTitle: string,
  metaDescription: string,
  ctaButtonText = "Get Started"
) => {
  try {
    const prompt = getLandingPagePromptTemplate(
      metaTitle,
      metaDescription,
      ctaButtonText
    );

    const res = await api.post(
      "/dashboard/jobs/mvp/generate",
      JSON.stringify({
        prompt,
        ideaId,
        mvpId,
        metaTitle,
        metaDescription,
      })
    );

    const resData = await res.json();

    if (!res.ok || resData.error) {
      console.error("API Error:", resData.error || `Status: ${res.status}`);

      return {
        error: resData.error || "Failed to generate MVP. Please try again.",
      };
    }

    return {
      message: resData.message || "MVP generation has been initiated.",
    };
  } catch (err) {
    console.error("Error generating MVP:", err);

    return {
      error: "Failed to generate MVP. Please try again.",
    };
  }
};
