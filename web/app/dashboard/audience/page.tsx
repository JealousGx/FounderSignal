import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/dashboard/audience/header";
import AudienceOverview from "@/components/dashboard/audience/overview";
import AudienceList from "@/components/dashboard/audience/list";
import EngagementMetrics from "@/components/dashboard/audience/engagement-metrics";
import { getAudienceStats, getAudienceMembers } from "@/lib/api";

export default async function AudiencePage() {
  // In a real app, this would be from auth
  const userId = "user_123";
  const stats = await getAudienceStats(userId);
  const audienceMembers = await getAudienceMembers(userId);

  return (
    <div className="space-y-8">
      <PageHeader totalSubscribers={stats.totalSubscribers} />

      <Suspense fallback={<Skeleton className="h-28 md:h-24 w-full" />}>
        <AudienceOverview stats={stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AudienceList members={audienceMembers} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <EngagementMetrics stats={stats} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
