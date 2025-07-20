"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { updateIdeaSchema, updateMVPSchema } from "./schema";

import { api } from "@/lib/api";
import {
  revalidateAPICfCache,
  revalidateCfCache,
} from "@/lib/cloudflare/cache";

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
    await Promise.all([
      await revalidateCfCache(`/explore/${ideaId}`),
      await revalidateAPICfCache(`/ideas/${ideaId}`),
    ]);

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
    await Promise.all([
      revalidateCfCache(`/explore/${id}`),
      revalidateCfCache(`/explore`),
      revalidateAPICfCache(`/ideas/`),
      revalidateAPICfCache(`/ideas/${id}`),
    ]);

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
  const user = await auth();
  if (!user?.userId) {
    return { error: "You must be signed in to set a landing page as active." };
  }

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

    revalidateTag(`idea-${ideaId}`);
    await Promise.all([
      revalidateCfCache(`/explore/${ideaId}`),
      revalidateAPICfCache(`/ideas/${ideaId}`),
    ]);

    return responseData;
  });
};

export const setMVPActive = async (ideaId: string, mvpId: string) => {
  const user = await auth();
  if (!user?.userId) {
    return { error: "You must be signed in to set a landing page as active." };
  }

  try {
    const response = await api.patch(
      `/dashboard/ideas/${ideaId}/mvp/${mvpId}/active`
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
          "Failed to set landing page as active. Please try again.",
      };
    }

    revalidateTag(`mvp-${mvpId}`);
    await Promise.all([
      revalidateCfCache(`/mvp/${ideaId}`),
      revalidateAPICfCache(`/ideas/${ideaId}/mvp`),
    ]);

    return {
      message: `Landing page "${responseData.mvp.name}" is now active!`,
    };
  } catch (err) {
    console.error("Error setting MVP active:", err);
    return { error: "Failed to set landing page as active. Please try again." };
  }
};

export const deleteMvp = async (ideaId: string, mvpId: string) => {
  const user = await auth();
  if (!user?.userId) {
    return { error: "You must be signed in to delete a landing page." };
  }

  try {
    const response = await api.delete(
      `/dashboard/ideas/${ideaId}/mvp/${mvpId}`
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
          "Failed to delete landing page. Please try again.",
      };
    }

    revalidateTag(`mvp-${mvpId}`);
    await Promise.all([
      revalidateCfCache(`/mvp/${ideaId}`),
      revalidateAPICfCache(`/ideas/${ideaId}/mvp`),
    ]);

    return {
      message: `Landing page "${responseData.mvp.name}" deleted successfully!`,
    };
  } catch (err) {
    console.error("Error deleting MVP:", err);
    return { error: "Failed to delete landing page. Please try again." };
  }
};

export const createMVP = async (ideaId: string) => {
  const user = await auth();
  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  try {
    const response = await api.post(`/dashboard/ideas/${ideaId}/mvp`);
    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error:
          responseData.error ||
          "Failed to create landing page. Please try again.",
      };
    }

    revalidateTag(`idea-${ideaId}`);

    return {
      message: `Landing page created successfully!`,
      mvpId: responseData.mvpId,
    };
  } catch (err) {
    console.log("Error creating MVP", err);

    return {
      error: "Error creating MVP",
    };
  }
};

export const fetchHtmlContent = async (
  ideaId: string,
  mvpId: string,
  htmlUrl: string
) => {
  try {
    const response = await fetch(htmlUrl, {
      headers: {
        "Content-Type": "text/html",
      },
      next: {
        tags: [`mvp-${ideaId}`],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch HTML content: ${response.statusText}`);
    }

    const htmlContent = await response.text();

    return htmlContent;
  } catch (error) {
    console.error(`Error fetching HTML content for mvp ${mvpId}:`, error);
    return null;
  }
};
