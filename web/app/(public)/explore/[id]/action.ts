"use server";

import { api } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { ReplyFormValues, messageSchema } from "./schema";

type FieldError = Partial<Record<keyof ReplyFormValues, string>>;

export type SubmitState = {
  message?: string;
  error?: string;
  fieldErrors?: FieldError;
};

export const submit = async (
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

  console.log("ideaId:", ideaId);
  console.log("commentId:", commentId);

  const payload: Record<string, string> = {
    comment: content,
  };

  let path = `/dashboard/ideas/${ideaId}/feedback`;
  if (commentId) {
    path += `/${commentId}`;
  }

  console.log("Payload:", payload);

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

    console.log("Response:", responseData);

    return {
      message: commentId
        ? "Reply submitted successfully!"
        : "Comment submitted successfully!",
    };
  } catch (e: any) {
    console.error("Submission failed:", e);

    return {
      error: e.message || "An unexpected error occurred during submission.",
    };
  }
};
