"use client";

import { Flag } from "lucide-react";
import { useState } from "react";

import { ReportDialog } from "./report";
import { Button } from "./ui/button";

export const ReportButton = ({
  commentId,
  ideaId,
}: {
  ideaId: string;
  commentId?: string;
}) => {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setReportDialogOpen(true)}
        variant="ghost"
        size="icon"
      >
        <Flag className="h-4 w-4" />
      </Button>

      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setReportDialogOpen}
        contentId={commentId || ideaId}
        contentType={commentId ? "comment" : "idea"}
        contentUrl={`${window.location.origin}/explore/${ideaId}?comment=${commentId}`}
      />
    </>
  );
};
