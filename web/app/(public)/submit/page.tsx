import React from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitIdea } from "@/lib/api";
import { redirect } from "next/navigation";

export default function SubmitPage() {
  const submit = async (formData: FormData) => {
    "use server";

    console.log("Submitting form data:", formData);

    await submitIdea({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetAudience: formData.get("targetAudience") as string,
      cta: formData.get("cta") as string,
    });

    redirect("/dashboard");
  };

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
        <form className="space-y-6" action={submit}>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Startup Name / Idea Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="AI-powered dog walker app"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              A clear, memorable name for your concept
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="An app that connects dog owners with AI-powered robots that can walk dogs safely when owners are busy."
              required
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Briefly explain what your product or service does and the main
              problem it solves
            </p>
          </div>

          <div>
            <label
              htmlFor="targetAudience"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target Audience
            </label>
            <Input
              id="targetAudience"
              name="targetAudience"
              placeholder="Dog owners in urban areas with busy work schedules"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Who is your ideal customer?
            </p>
          </div>

          <div>
            <label
              htmlFor="cta"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Call to Action
            </label>
            <Input
              id="cta"
              name="cta"
              placeholder="Join waitlist"
              defaultValue="Join waitlist"
            />
            <p className="text-xs text-gray-500 mt-1">
              The text visitors will see on your signup button
            </p>
          </div>

          <div className="flex items-start p-3 bg-primary/10 rounded-lg">
            <AlertCircle className="text-primary/80 mr-3 h-5 w-5 mt-0.5" />

            <p className="text-sm text-primary">
              Your page will be created within minutes. It will appear in your
              dashboard once it&apos;s ready.
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Create My Validation Page
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help?{" "}
          <a href="#" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
