import { Suspense } from "react";

import EngagementMetrics from "@/components/dashboard/audience/engagement-metrics";
import PageHeader from "@/components/dashboard/audience/header";
import AudienceList from "@/components/dashboard/audience/list";
import AudienceOverview from "@/components/dashboard/audience/overview";
import { Skeleton } from "@/components/ui/skeleton";

import { getAudience } from "./get-audience";

export const dynamic = "force-dynamic";

export default async function AudiencePage() {
  const data = await getAudience(true, { limit: 10 });

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold">No audience data available</h2>
        <p className="text-muted-foreground">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader totalSubscribers={data.stats.totalSubscribers} />

      <Suspense fallback={<Skeleton className="h-28 md:h-24 w-full" />}>
        <AudienceOverview stats={data.stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AudienceList
              members={data.audiences}
              total={data.stats.totalSubscribers}
            />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <EngagementMetrics stats={data.stats} metrics={data.metrics} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
