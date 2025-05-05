"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Idea } from "@/types/idea";

// Schema for landing page content
const formSchema = z.object({
  headline: z.string().min(5, {
    message: "Headline must be at least 5 characters.",
  }),
  subheadline: z.string().min(10, {
    message: "Subheadline must be at least 10 characters.",
  }),
  ctaText: z.string().min(2, {
    message: "CTA text must be at least 2 characters.",
  }),
  ctaButtonText: z.string().min(2, {
    message: "Button text must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface LandingPageFormProps {
  idea: Idea;
}

export default function LandingPageForm({ idea }: LandingPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, you would fetch the landing page content from an API
  // For now, we'll use placeholder data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headline: "Track Your Environmental Impact",
      subheadline:
        "Make sustainable choices and see the direct impact of your decisions on the environment.",
      ctaText:
        "Join thousands of eco-conscious individuals making a difference today.",
      ctaButtonText: "Get Early Access",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call to update the landing page
      console.log("Landing page form submitted with:", data);

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Landing page updated", {
        description: "Your landing page has been successfully updated.",
        dismissible: true,
      });
    } catch (error) {
      toast.error("Error updating landing page", {
        description:
          "There was a problem updating your landing page. Please try again.",
      });
      console.error("Error updating landing page:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
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
                        A brief explanation of your product that appears under
                        the headline.
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
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="min-w-[120px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
