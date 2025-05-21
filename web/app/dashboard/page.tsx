import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache, Suspense } from "react";

import ActivityFeed from "@/components/dashboard/activity-feed";
import IdeaAnalytics from "@/components/dashboard/ideas/idea-analytics";
import RecentIdeas from "@/components/dashboard/ideas/recent-ideas";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import WelcomeBanner from "@/components/dashboard/welcome-banner";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/api";
import { getName } from "@/lib/utils";

const getDashboardData = cache(async () => {
  try {
    const response = await api.get("/dashboard", {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`ideas`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching getDashboardData:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return null;
  }
});

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) {
    redirect("/explore");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <WelcomeBanner firstName={getName(user)} />

      <Suspense fallback={<Skeleton className="h-[180px] w-full rounded-xl" />}>
        <MetricsOverview metrics={data.metrics} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense
            fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
          >
            <RecentIdeas recentIdeas={data.recentIdeas} />
          </Suspense>

          <Suspense
            fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}
          >
            <IdeaAnalytics analytics={data.analyticsData} />
          </Suspense>
        </div>

        <div>
          <Suspense
            fallback={<Skeleton className="h-[500px] w-full rounded-xl" />}
          >
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
