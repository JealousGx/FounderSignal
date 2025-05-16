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

import { submitReply, SubmitState } from "@/components/comments/actions";
import { messageSchema, ReplyFormValues } from "@/components/comments/schema";
import { Input } from "@/components/ui/input";

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
  >(submitReply, null);

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
    <Form {...form}>
      <form
        ref={formRef}
        className="flex gap-2"
        action={handleAction}
        noValidate
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Add a comment or question..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Post"}
        </Button>
      </form>
    </Form>
  );
};

interface ReplyFormProps {
  ideaId: string;
  userId: string | null;
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
  >(submitReply, null);

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
    formData.append("userId", userId || "");
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
                    className="w-full border bg-gray-50 border-gray-300 rounded-lg p-2 min-h-[50px]"
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
