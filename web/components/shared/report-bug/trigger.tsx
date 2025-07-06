"use client";

import { Bug } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BugReportDialog } from ".";

import { cn } from "@/lib/utils";

export function BugReportTrigger({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "footer";
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const isSidebar = variant === "sidebar";

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "gap-0",
          isSidebar
            ? "w-full justify-start text-gray-700"
            : "text-sm text-gray-500 hover:text-gray-900 p-0 h-auto"
        )}
        onClick={() => setDialogOpen(true)}
      >
        {isSidebar && <Bug className="w-5 h-5 mr-3 text-gray-500" />}
        Report a Bug
      </Button>
      <BugReportDialog isOpen={isDialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
