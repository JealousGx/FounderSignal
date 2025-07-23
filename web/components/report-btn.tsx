"use client";

import { Flag } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "./ui/button";

const ReportDialog = dynamic(
  () => import("./report").then((mod) => mod.ReportDialog),
  {
    ssr: false,
  }
);

export const ReportButton = ({
  commentId,
  ideaId,
}: {
  ideaId: string;
  commentId?: string;
}) => {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);

  let contentUrl = `${window.location.origin}/explore/${ideaId}`;
  if (commentId) {
    contentUrl += `?comment=${commentId}`;
  }

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
        contentUrl={contentUrl}
      />
    </>
  );
};
