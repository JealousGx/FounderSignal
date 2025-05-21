"use server";

import { api } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { ReplyFormValues, messageSchema } from "./schema";

type FieldError = Partial<Record<keyof ReplyFormValues, string>>;

export type SubmitState = {
  message?: string;
  error?: string;
  fieldErrors?: FieldError;
};

export const submitReply = async (
  prevState: SubmitState | null,
  formData: FormData
): Promise<SubmitState> => {
  const user = await auth();
  if (!user.userId) {
    return { error: "You must be signed in to submit a reply." };
  }

  const rawFormData = Object.fromEntries(formData);

  const validatedFields = messageSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: FieldError = {};
    for (const issue of validatedFields.error.issues) {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof ReplyFormValues] = issue.message;
      }
    }
    return {
      error: "Validation failed. Please check the form fields.",
      fieldErrors: fieldErrors,
    };
  }

  const ideaId = formData.get("ideaId") as string;
  const commentId = formData.get("commentId") as string | null;
  const content = validatedFields.data.content;

  const payload: Record<string, string> = {
    comment: content,
  };

  let path = `/dashboard/ideas/${ideaId}/feedback`;
  if (commentId) {
    path += `/${commentId}`;
  }

  try {
    const response = await api.post(path, JSON.stringify(payload));
    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      console.error(
        "API Error:",
        responseData.error || `Status: ${response.status}`
      );
      return {
        error:
          responseData.error ||
          (commentId
            ? "Failed to submit reply. Please try again."
            : "Failed to submit comment. Please try again."),
      };
    }

    revalidateTag(`comments-${ideaId}`);

    return {
      message: commentId
        ? "Reply submitted successfully!"
        : "Comment submitted successfully!",
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

export const submitReaction = async (
  ideaId: string,
  type: "like" | "dislike" | "remove",
  commentId?: string
) => {
  if (ideaId === "") {
    return {
      error: "Idea ID required.",
    };
  }

  let revalidationTag = `idea-${ideaId}`;
  let path = `/dashboard/ideas/${ideaId}/reaction`;
  if (commentId) {
    path = `/dashboard/ideas/${ideaId}/feedback/${commentId}/reaction`;
    revalidationTag = `comments-${ideaId}`;
  }

  const payload = {
    type,
  };

  try {
    const response = await api.put(path, JSON.stringify(payload));
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("API Error:", data.error || `Status: ${response.status}`);

      return {
        error: data.error || "Failed to submit reaction",
      };
    }

    revalidateTag(revalidationTag);

    return {
      message: "Reaction submitted successfully!",
      likes: data.likes,
      dislikes: data.dislikes,
      userReaction: data.userReaction,
    };
  } catch (e: unknown) {
    console.error("Reaction submission failed:", e);

    return {
      error: (e as Error).message || "An unexpected error occurred.",
    };
  }
};

export const updateComment = async (
  ideaId: string,
  commentId: string,
  content: string
) => {
  if (commentId === "") {
    return {
      error: "Comment ID is required.",
    };
  }

  const payload = {
    comment: content,
  };

  const path = `/dashboard/feedback/${commentId}`;

  try {
    const response = await api.put(path, JSON.stringify(payload));

    if (!response.ok || response.status !== 204) {
      const data = await response.json();
      console.error("API Error:", data || `Status: ${response.status}`);

      return {
        error: "Failed to update comment",
      };
    }

    revalidateTag(`comments-${ideaId}`);

    return {
      message: "Comment updated successfully!",
    };
  } catch (e: unknown) {
    console.error("Comment update failed:", e);

    return {
      error: (e as Error).message || "An unexpected error occurred.",
    };
  }
};

export const deleteComment = async (
  ideaId: string,
  commentId: string
): Promise<{ error?: string; message?: string }> => {
  if (commentId === "") {
    return {
      error: "Comment ID is required.",
    };
  }

  const path = `/dashboard/feedback/${commentId}`;

  try {
    const response = await api.delete(path);

    if (!response.ok || response.status !== 204) {
      const data = await response.json();
      console.error("API Error:", data.error || `Status: ${response.status}`);

      return {
        error: data.error || "Failed to delete comment",
      };
    }

    revalidateTag(`comments-${ideaId}`);

    return {
      message: "Comment deleted successfully!",
    };
  } catch (e: unknown) {
    console.error("Comment deletion failed:", e);

    return {
      error: (e as Error).message || "An unexpected error occurred.",
    };
  }
};
