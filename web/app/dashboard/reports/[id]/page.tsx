import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { getReportById } from "@/lib/api";
import ReportHeader from "@/components/dashboard/validation-reports/single/header";
import ReportOverview from "@/components/dashboard/validation-reports/single/overview";
import ConversionMetrics from "@/components/dashboard/validation-reports/single/conversion-metrics";
import TimelineData from "@/components/dashboard/validation-reports/single/timeline-data";
import ValidationStatus from "@/components/dashboard/validation-reports/single/validation-status";
import ActionItems from "@/components/dashboard/validation-reports/single/action-items";

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-semibold text-lg md:text-xl">Validation Report</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <ReportHeader report={report} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ReportOverview report={report} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ConversionMetrics report={report} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <TimelineData report={report} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ValidationStatus report={report} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ActionItems report={report} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
