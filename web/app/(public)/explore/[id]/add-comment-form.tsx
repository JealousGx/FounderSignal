"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { submit, SubmitState } from "./action";
import { messageSchema, ReplyFormValues } from "./schema";

export const AddCommentForm = ({
  userId,
  ideaId,
}: {
  ideaId: string;
  userId: string;
}) => {
  const [state, formAction, isPending] = useActionState<
    SubmitState | null,
    FormData
  >(submit, null);

  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      if (state.fieldErrors) {
        for (const [fieldName, message] of Object.entries(state.fieldErrors)) {
          if (message) {
            form.setError(fieldName as keyof ReplyFormValues, {
              type: "server",
              message,
            });
          }
        }
      }
    }
    if (state?.message && !state.error) {
      form.reset();

      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, form]);

  const handleAction = async (formData: FormData) => {
    formData.append("userId", userId);
    formData.append("ideaId", ideaId);

    return formAction(formData);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <h3 className="text-md font-medium mb-4">Leave a comment</h3>

      <Form {...form}>
        <form
          ref={formRef}
          className="space-y-4"
          id="comment-form"
          action={handleAction}
          noValidate
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
                    placeholder="Share your thoughts on this idea..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              className="flex justify-end w-max"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Post comment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

interface ReplyFormProps {
  ideaId: string;
  userId: string;
  commentId: string;
  initialMention?: string;
  onReplyAdded?: () => void;
  onCancel?: () => void;
}

export const ReplyForm = ({
  ideaId,
  userId,
  commentId,
  initialMention,
  onReplyAdded,
  onCancel,
}: ReplyFormProps) => {
  const [state, formAction, isPending] = useActionState<
    SubmitState | null,
    FormData
  >(submit, null);

  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: initialMention || "",
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();

      if (initialMention) {
        const length = initialMention.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }
  }, [initialMention]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      if (state.fieldErrors) {
        for (const [fieldName, message] of Object.entries(state.fieldErrors)) {
          if (message) {
            form.setError(fieldName as keyof ReplyFormValues, {
              type: "server",
              message,
            });
          }
        }
      }
    }
    if (state?.message && !state.error) {
      onReplyAdded?.();
      onCancel?.();

      form.reset();

      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, form, onReplyAdded, onCancel]);

  const handleAction = async (formData: FormData) => {
    formData.append("userId", userId);
    formData.append("ideaId", ideaId);
    formData.append("commentId", commentId);

    return formAction(formData);
  };

  return (
    <div className="pl-4 pr-2 py-3 rounded-md mt-2 w-full">
      <Form {...form}>
        <form
          ref={formRef}
          className="space-y-3"
          action={handleAction}
          noValidate
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="w-full border border-gray-300 rounded-lg p-2 min-h-[50px]"
                    placeholder="Write your reply..."
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      textareaRef.current = e;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="text-sm"
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" className="text-sm" disabled={isPending}>
              {isPending ? "Submitting..." : "Reply"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
