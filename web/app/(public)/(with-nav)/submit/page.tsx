"use client";

import { AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import {
  generateMVPWithAI,
  updateMVP,
} from "../../mvp/[ideaId]/edit/hooks/actions";
import { getValidatedHtml } from "../../mvp/[ideaId]/edit/hooks/validation";
import { submitIdea, SubmitIdeaState } from "./action";
import { formSchema } from "./schema";

const NextStepsModal = dynamic(
  () =>
    import("@/components/dashboard/next-steps-modal").then(
      (mod) => mod.NextStepsModal
    ),
  { ssr: false }
);

export default function SubmitPage() {
  const [state, formAction, isPending] = useActionState<
    SubmitIdeaState | null,
    FormData
  >(submitIdea, null);

  const router = useRouter();
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAudience: "",
      ctaButtonText: "Join waitlist",
      forceNew: "true",
    },
  });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      if (state.fieldErrors) {
        for (const [fieldName, message] of Object.entries(state.fieldErrors)) {
          if (message) {
            form.setError(fieldName as keyof z.infer<typeof formSchema>, {
              type: "server",
              message,
            });
          }
        }
      }
    }

    if (state?.message && !state.error) {
      const createMVPWithAI = async () => {
        console.log("Creating MVP with AI...", state.ideaId, state.mvpId);
        if (state.ideaId && state.mvpId) {
          const title = form.getValues("title");
          const description = form.getValues("description");
          const ctaButtonText = form.getValues("ctaButtonText");

          const generatedHTML = await generateMVPWithAI(
            state.ideaId,
            state.mvpId,
            title,
            description,
            ctaButtonText
          );

          if (generatedHTML.error) {
            console.error("Error generating MVP with AI:", generatedHTML.error);
            return;
          }

          if (generatedHTML.htmlContent) {
            const validatedHtmlRes = getValidatedHtml(
              state.ideaId,
              state.mvpId,
              generatedHTML.htmlContent,
              undefined,
              title,
              description,
              "ctaButton"
            );

            if (!validatedHtmlRes.isValid) {
              console.warn(
                "HTML validation failed:",
                validatedHtmlRes.errorMessage
              );
              return;
            }

            if (validatedHtmlRes.html) {
              const updatedMVPRes = await updateMVP(
                state.ideaId,
                state.mvpId,
                validatedHtmlRes.html
              );

              if (updatedMVPRes.error) {
                console.error("Error updating MVP:", updatedMVPRes.error);
                return;
              }
            }
          }
        }
      };

      createMVPWithAI();

      toast.success(state.message);
      form.reset();

      if (formRef.current) {
        formRef.current.reset();
      }

      setShowNextStepsModal(true);
    }
  }, [state, form, router]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-primary">
            Step 1 of 3: Describe Your Idea
          </span>
        </span>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Let&apos;s validate your startup idea
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Tell us about your concept and we&apos;ll create a landing page to
          test market interest.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <Form {...form}>
          <form
            ref={formRef}
            className="space-y-8"
            action={formAction}
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    Startup Name / Idea Title
                  </FormLabel>

                  <FormControl>
                    <Input placeholder="AI-powered dog walker app" {...field} />
                  </FormControl>

                  <FormDescription className="text-xs text-gray-500 mt-1">
                    A clear, memorable name for your concept
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="An app that connects dog owners with AI-powered robots that can walk dogs safely when owners are busy."
                      {...field}
                    />
                  </FormControl>

                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Briefly explain what your product or service does and the
                    main problem it solves
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Dog owners in urban areas with busy work schedules"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Who is your ideal customer?
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
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    Call to Action
                  </FormLabel>

                  <FormControl>
                    <Input placeholder="Join waitlist" {...field} />
                  </FormControl>

                  <FormDescription className="text-xs text-gray-500 mt-1">
                    The text visitors will see on your signup button
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="forceNew"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <div>
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value}
                      />

                      <Checkbox
                        checked={field.value !== "true"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "false" : "true")
                        }
                        id="forceNew"
                      />
                    </div>
                  </FormControl>
                  <FormLabel
                    htmlFor="forceNew"
                    className="text-sm font-medium text-gray-700 mb-0"
                  >
                    Restore old if exists?
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start p-3 bg-primary/10 rounded-lg">
              <AlertCircle className="text-primary/80 mr-3 h-5 w-5 mt-0.5" />

              <p className="text-sm text-primary">
                Your page will be created within minutes. It will appear in your
                dashboard once it&apos;s ready.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating..." : "Create My Validation Page"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help?{" "}
          <a
            href="mailto:support@foundersignal.app"
            className="text-primary hover:underline"
          >
            Contact our support team
          </a>
        </p>
      </div>

      {state?.ideaId && (
        <NextStepsModal
          open={showNextStepsModal}
          onClose={() => setShowNextStepsModal(false)}
          ideaId={state.ideaId}
        />
      )}
    </div>
  );
}
