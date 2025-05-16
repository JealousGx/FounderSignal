"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { LandingPage } from "@/types/idea";
import { updateMVP, UpdateMVPState } from "./actions";
import { updateMVPSchema, UpdateMVPSchema } from "./schema";

interface LandingPageFormProps {
  landingPage: LandingPage;
}

export default function LandingPageForm({ landingPage }: LandingPageFormProps) {
  const [state, formAction, isPending] = useActionState<
    UpdateMVPState | null,
    FormData
  >(updateMVP, null);

  const [, startTransition] = useTransition();

  const form = useForm<UpdateMVPSchema>({
    resolver: zodResolver(updateMVPSchema),
    defaultValues: {
      headline: landingPage.headline || "",
      subheadline: landingPage.subheadline || "",
      ctaText: landingPage.ctaText || "",
      ctaButtonText: landingPage.ctaButtonText || "",
    },
  });

  const onSubmit = async (data: UpdateMVPSchema) => {
    const formData = new FormData();
    formData.append("headline", data.headline);
    formData.append("subheadline", data.subheadline);
    formData.append("ctaText", data.ctaText);
    formData.append("ctaButtonText", data.ctaButtonText);
    formData.append("ideaId", landingPage.ideaId);

    startTransition(() => {
      formAction(formData);
    });
  };

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Reset form values when idea changes
    form.reset({
      headline: landingPage.headline || "",
      subheadline: landingPage.subheadline || "",
      ctaText: landingPage.ctaText || "",
      ctaButtonText: landingPage.ctaButtonText || "",
    });
  }, [landingPage, form]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      if (state.fieldErrors) {
        for (const [fieldName, message] of Object.entries(state.fieldErrors)) {
          if (message) {
            form.setError(fieldName as keyof UpdateMVPSchema, {
              type: "server",
              message,
            });
          }
        }
      }
    }
    if (state?.message && !state.error) {
      toast.success("Landing page updated successfully!", {
        description:
          "Your landing page details have been successfully updated.",
      });

      form.reset();

      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, form]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Content</CardTitle>
          <CardDescription>
            Edit the content displayed on your idea&apos;s landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              ref={formRef}
            >
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your main headline"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main headline that visitors will see first.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subheadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheadline</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your subheadline"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief explanation of your product that appears under the
                      headline.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call to Action Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your call to action text"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Text that encourages visitors to sign up.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaButtonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Text for your call to action button"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The text displayed on your main call-to-action button.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="min-w-[120px]"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
