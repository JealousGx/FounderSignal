"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { RedditValidation } from "@/types/reddit-validation";
import { DetailedReport } from "./detailed-report";

interface ReportModalProps {
  validation: RedditValidation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ validation, isOpen, onClose }: ReportModalProps) {
  if (!validation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Reddit Validation Report</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <DetailedReport validation={validation} />
      </DialogContent>
    </Dialog>
  );
}
