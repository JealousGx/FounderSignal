// import { Suspense } from "react";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import MetricsOverview from "@/components/dashboard/metrics-overview";
// import RecentIdeas from "@/components/dashboard/recent-ideas";
// import ActivityFeed from "@/components/dashboard/activity-feed";
// import IdeaAnalytics from "@/components/dashboard/idea-analytics";
// import WelcomeBanner from "@/components/dashboard/welcome-banner";
// import { Skeleton } from "@/components/ui/skeleton";
// import { getTopIdeasForUser } from "@/lib/api";

// export default async function Dashboard() {
//   // const { userId } = await auth();
//   const userId = "user_123"; // Placeholder for user ID, replace with actual auth logic

//   // if (!userId) {
//   //   redirect("/sign-in");
//   // }

//   // Fetch top performing ideas
//   const topIdeas = await getTopIdeasForUser(userId);

//   return (
//     <div className="space-y-6">
//       {/* Welcome section with key metrics */}
//       <WelcomeBanner />

//       {/* Metrics Overview */}
//       <Suspense fallback={<Skeleton className="h-[180px] w-full rounded-xl" />}>
//         <MetricsOverview userId={userId} />
//       </Suspense>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent ideas - takes 2/3 of space on desktop */}
//         <div className="lg:col-span-2 space-y-6">
//           <Suspense
//             fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
//           >
//             <RecentIdeas userId={userId} />
//           </Suspense>

//           <Suspense
//             fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}
//           >
//             <IdeaAnalytics ideas={topIdeas} />
//           </Suspense>
//         </div>

//         {/* Activity feed - takes 1/3 of space */}
//         <div>
//           <Suspense
//             fallback={<Skeleton className="h-[500px] w-full rounded-xl" />}
//           >
//             <ActivityFeed userId={userId} />
//           </Suspense>
//         </div>
//       </div>
//     </div>
//   );
// }

import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import RecentIdeas from "@/components/dashboard/ideas/recent-ideas";
import ActivityFeed from "@/components/dashboard/activity-feed";
import IdeaAnalytics from "@/components/dashboard/idea-analytics";
import WelcomeBanner from "@/components/dashboard/welcome-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopIdeasForUser } from "@/lib/api";
import MobileDashboardNav from "@/components/dashboard/mobile-nav";

export default async function Dashboard() {
  // const { userId } = await auth();
  const userId = "user_123"; // Placeholder for user ID, replace with actual auth logic

  // if (!userId) {
  //   redirect("/sign-in");
  // }

  // Fetch top performing ideas
  const topIdeas = await getTopIdeasForUser(userId);

  return (
    <>
      {/* Mobile navigation - only shows on small screens */}
      {/* <div className="md:hidden mb-6">
        <MobileDashboardNav />
      </div> */}

      <div className="space-y-6 pb-20 md:pb-0">
        {/* Welcome section with key metrics */}
        <WelcomeBanner />

        {/* Metrics Overview */}
        <Suspense
          fallback={<Skeleton className="h-[180px] w-full rounded-xl" />}
        >
          <MetricsOverview userId={userId} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent ideas - takes 2/3 of space on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense
              fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
            >
              <RecentIdeas userId={userId} />
            </Suspense>

            <Suspense
              fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}
            >
              <IdeaAnalytics ideas={topIdeas} />
            </Suspense>
          </div>

          {/* Activity feed - takes 1/3 of space */}
          <div>
            <Suspense
              fallback={<Skeleton className="h-[500px] w-full rounded-xl" />}
            >
              <ActivityFeed userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
