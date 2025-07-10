"use client";

import { useActionState, useEffect, useRef } from "react";
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

import { ReportState, submitReport } from "./actions";

interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentId: string;
  contentType: "idea" | "comment";
  contentUrl: string;
}

export function ReportDialog({
  isOpen,
  onOpenChange,
  contentId,
  contentType,
  contentUrl,
}: ReportDialogProps) {
  const [state, formAction, isPending] = useActionState<
    ReportState | null,
    FormData
  >(submitReport, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      onOpenChange(false);
    }

    if (state?.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Please provide a reason for reporting this {contentType}. Your
            feedback is important for maintaining a healthy community.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction}>
          <input type="hidden" name="contentId" value={contentId} />
          <input type="hidden" name="contentType" value={contentType} />
          <input type="hidden" name="contentUrl" value={contentUrl} />

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for reporting</Label>

              <Textarea
                id="reason"
                name="reason"
                placeholder={`e.g., This ${contentType} is spam or abusive.`}
                required
              />

              {state?.fieldErrors?.reason && (
                <p className="text-sm text-red-500">
                  {state.fieldErrors.reason}
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
              {isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
