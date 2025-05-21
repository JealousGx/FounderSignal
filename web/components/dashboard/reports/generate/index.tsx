"use client";

import { VariantProps } from "class-variance-authority";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IdeaStatus } from "@/types/idea";
import { ReportType } from "@/types/report";
import { generateReport } from "./generate";

interface GenerateReportProps {
  ideaId?: string;
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  onReportGenerated?: () => void;
}

export default function GenerateReports({
  ideaId,
  triggerSize,
}: GenerateReportProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [ideaStatus, setIdeaStatus] = useState<IdeaStatus>();

  const router = useRouter();

  const handleGenerateReport = async () => {
    if (ideaId === "" && !ideaStatus) {
      toast.error("Please select an idea or status to generate a report");
      return;
    }

    setIsLoading(true);

    try {
      await generateReport(reportType, ideaId, ideaStatus);

      toast.success(
        `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } report(s) generated successfully!`
      );

      setOpen(false);

      router.push(`/dashboard/reports`);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={triggerSize}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate Report(s)
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Generate New Report(s) {ideaId && `For This Idea`}
          </DialogTitle>
          <DialogDescription>
            Create new validation report(s) based on the latest analytics data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 w-full">
          {!ideaId && (
            <div className="grid gap-2 py-4 w-full">
              <Label htmlFor="ideaStatus">Idea Status</Label>
              <Select
                value={ideaStatus}
                onValueChange={(value) => setIdeaStatus(value as IdeaStatus)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select idea status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2 py-4 w-full">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report(s)"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
