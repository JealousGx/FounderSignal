"use server";

import { api } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { updateIdeaSchema, updateMVPSchema } from "./schema";

type FieldError = Partial<
  Record<keyof z.infer<typeof updateIdeaSchema>, string>
>;

type MVPFieldError = Partial<
  Record<keyof z.infer<typeof updateMVPSchema>, string>
>;

export type UpdateIdeaState = {
  message?: string;
  error?: string;
  fieldErrors?: FieldError;
};

export type UpdateMVPState = {
  message?: string;
  error?: string;
  fieldErrors?: MVPFieldError;
};

export const updateIdeaRequest = async (
  ideaId: string,
  attributes: Record<string, unknown>
) =>
  api
    .put(`/dashboard/ideas/${ideaId}`, JSON.stringify(attributes))
    .then((res) => {
      revalidateTag(`idea-${ideaId}`);
      return res;
    });

export const updateIdea = async (
  prevState: UpdateIdeaState | null,
  formData: FormData
): Promise<UpdateIdeaState> => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to update an idea." };
  }

  const rawFormData = Object.fromEntries(formData);
  const ideaId = rawFormData.ideaId as string;

  const validatedFields = updateIdeaSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: FieldError = {};
    for (const issue of validatedFields.error.issues) {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof z.infer<typeof updateIdeaSchema>] =
          issue.message;
      }
    }
    return {
      error: "Validation failed. Please check the form fields.",
      fieldErrors: fieldErrors,
    };
  }

  const updatedIdea = validatedFields.data;

  try {
    const response = await updateIdeaRequest(ideaId, updatedIdea);
    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error: responseData.error || "Failed to update idea. Please try again.",
      };
    }

    revalidateTag(`idea-${ideaId}`);

    return {
      message: `Idea updated successfully!`,
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

export const updateMVP = async (
  prevState: UpdateMVPState | null,
  formData: FormData
): Promise<UpdateMVPState> => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to update an idea." };
  }

  const rawFormData = Object.fromEntries(formData);
  const ideaId = rawFormData.ideaId as string;

  const validatedFields = updateMVPSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: MVPFieldError = {};
    for (const issue of validatedFields.error.issues) {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof z.infer<typeof updateMVPSchema>] =
          issue.message;
      }
    }
    return {
      error: "Validation failed. Please check the form fields.",
      fieldErrors: fieldErrors,
    };
  }

  const updatedMVP = validatedFields.data;

  try {
    const response = await api.put(
      `/dashboard/ideas/${ideaId}/mvp`,
      JSON.stringify(updatedMVP)
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

    revalidateTag(`idea-${ideaId}`);

    return {
      message: `Landing page updated successfully!`,
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

export const deleteIdea = async (id: string) => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to delete an idea." };
  }

  try {
    const response = await api.delete(`/dashboard/ideas/${id}`);
    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error: responseData.error || "Failed to delete idea. Please try again.",
      };
    }

    revalidateTag(`ideas`);

    return {
      message: `Idea deleted successfully!`,
    };
  } catch (e: unknown) {
    console.error("Deletion failed:", e);

    return {
      error:
        (e as Error).message || "An unexpected error occurred during deletion.",
    };
  }
};

export const updateIdeaAttributes = async (
  ideaId: string,
  attributes: Record<string, unknown>
) => {
  return updateIdeaRequest(ideaId, attributes).then(async (res) => {
    const responseData = await res.json();
    if (!res.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${res.status}`
      );
      return {
        error: responseData.error || "Failed to update idea. Please try again.",
      };
    }

    return responseData;
  });
};
