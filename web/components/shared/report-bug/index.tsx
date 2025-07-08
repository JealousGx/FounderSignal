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
import { Textarea } from "@/components/ui/textarea";

import { BugReportState, submitBugReport } from "./actions";

interface BugReportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function BugReportDialog({
  isOpen,
  onOpenChange,
}: BugReportDialogProps) {
  const [state, formAction, isPending] = useActionState<
    BugReportState | null,
    FormData
  >(submitBugReport, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      onOpenChange(false);
      formRef.current?.reset();
    }

    if (state?.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>

          <DialogDescription>
            Spotted an issue? Please describe it below. Your detailed feedback
            helps us improve the platform.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction}>
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

              {state?.fieldErrors?.description && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.description}
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

              {state?.fieldErrors?.stepsToReproduce && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.stepsToReproduce}
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

            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Bug Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
