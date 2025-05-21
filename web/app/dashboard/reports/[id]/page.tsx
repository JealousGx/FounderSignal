import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import ActionItems from "@/components/dashboard/validation-reports/single/action-items";
import ConversionMetrics from "@/components/dashboard/validation-reports/single/conversion-metrics";
import ReportHeader from "@/components/dashboard/validation-reports/single/header";
import ReportOverview from "@/components/dashboard/validation-reports/single/overview";
import TimelineData from "@/components/dashboard/validation-reports/single/timeline-data";
import ValidationStatus from "@/components/dashboard/validation-reports/single/validation-status";
import { Skeleton } from "@/components/ui/skeleton";

import { Link } from "@/components/ui/link";
import { api } from "@/lib/api";

const getReport = cache(async (id: string) => {
  try {
    const response = await api.get(`/dashboard/reports/${id}`, {
      next: {
        revalidate: false,
        tags: [`report-${id}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching getReport:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    return data ?? null;
  } catch (error) {
    console.error("Error in getReport:", error);
    return null;
  }
});

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  const data = await getReport(id);

  if (!data || !data.report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link variant="ghost" size="icon" href="/dashboard/reports">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-semibold text-lg md:text-xl">Validation Report</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <ReportHeader report={data.report} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ReportOverview report={data.report} overview={data.overview} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ConversionMetrics report={data.report} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <TimelineData timelineData={data.signupsTimeline} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ValidationStatus
              report={data.report}
              thresholds={data.validationThreshold}
            />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ActionItems report={data.report} insights={data.insights} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
