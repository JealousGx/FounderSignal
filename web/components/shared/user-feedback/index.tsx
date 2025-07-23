"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  BugReportState,
  FeatureSuggestionState,
  submitBugReport,
  submitFeatureSuggestion,
} from "./actions";

interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function FeedbackDialog({ isOpen, onOpenChange }: FeedbackDialogProps) {
  const [tab, setTab] = useState<"bug" | "feature">("bug");

  const [bugState, bugFormAction, bugPending] = useActionState<
    BugReportState | null,
    FormData
  >(submitBugReport, null);

  const [featureState, featureFormAction, featurePending] = useActionState<
    FeatureSuggestionState | null,
    FormData
  >(submitFeatureSuggestion, null);

  const bugFormRef = useRef<HTMLFormElement>(null);
  const featureFormRef = useRef<HTMLFormElement>(null);

  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (bugState?.message) {
      toast.success(bugState.message);
      onOpenChange(false);
      bugFormRef.current?.reset();
    }
    if (bugState?.error && !bugState.fieldErrors) {
      toast.error(bugState.error);
    }
  }, [bugState, onOpenChange]);

  useEffect(() => {
    if (featureState?.message) {
      toast.success(featureState.message);
      onOpenChange(false);
      featureFormRef.current?.reset();
    }
    if (featureState?.error && !featureState.fieldErrors) {
      toast.error(featureState.error);
    }
  }, [featureState, onOpenChange]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tab === "bug" ? "Report a Bug" : "Suggest a Feature"}
          </DialogTitle>

          <DialogDescription>
            {tab === "bug"
              ? "Spotted an issue? Please describe it below. Your detailed feedback helps us improve the platform."
              : "Have an idea for a new feature? Let us know how we can make FounderSignal better for you."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "bug" | "feature")}
        >
          <TabsList className="mb-4 bg-gray-200">
            <TabsTrigger value="bug">Report a Bug</TabsTrigger>

            <TabsTrigger value="feature">Suggest a Feature</TabsTrigger>
          </TabsList>

          <TabsContent value="bug">
            <form ref={bugFormRef} action={bugFormAction}>
              <input type="hidden" name="pageUrl" value={pageUrl} />

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Bug Description</Label>

                  <Textarea
                    id="description"
                    name="description"
                    placeholder="e.g., The 'Save' button is not working on the idea edit page."
                    required
                  />

                  {bugState?.fieldErrors?.description && (
                    <p className="text-sm text-red-500">
                      {bugState.fieldErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>

                  <Textarea
                    id="stepsToReproduce"
                    name="stepsToReproduce"
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    required
                  />

                  {bugState?.fieldErrors?.stepsToReproduce && (
                    <p className="text-sm text-red-500">
                      {bugState.fieldErrors.stepsToReproduce}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={bugPending}>
                  {bugPending ? "Submitting..." : "Submit Bug Report"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="feature">
            <form ref={featureFormRef} action={featureFormAction}>
              <input type="hidden" name="pageUrl" value={pageUrl} />

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Feature Title</Label>

                  <Textarea
                    id="title"
                    name="title"
                    placeholder="e.g., Add dark mode support"
                    required
                  />

                  {featureState?.fieldErrors?.title && (
                    <p className="text-sm text-red-500">
                      {featureState.fieldErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Feature Description</Label>

                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your idea and how it would help you or others."
                    required
                  />

                  {featureState?.fieldErrors?.description && (
                    <p className="text-sm text-red-500">
                      {featureState.fieldErrors.description}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={featurePending}>
                  {featurePending
                    ? "Submitting..."
                    : "Submit Feature Suggestion"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
