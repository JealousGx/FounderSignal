import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import IdeasStatCards from "@/components/dashboard/ideas/page/stat-cards";
import IdeasDataView from "@/components/dashboard/ideas/page/data-view";
import { getUserIdeas } from "@/lib/api";
import IdeasPageHeader from "@/components/dashboard/ideas/page/header";

export default async function IdeasPage() {
  const userId = "user_123"; // Replace with actual auth logic
  const ideas = await getUserIdeas(userId);

  const activeIdeas = ideas.filter((idea) => idea.status === "Active");
  const totalSignups = ideas.reduce((total, idea) => total + idea.signups, 0);
  const totalViews = ideas.reduce((total, idea) => total + idea.views, 0);

  return (
    <div className="space-y-6">
      <IdeasPageHeader />

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        }
      >
        <IdeasStatCards
          totalIdeas={ideas.length}
          activeIdeas={activeIdeas.length}
          totalSignups={totalSignups}
          totalViews={totalViews}
        />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <IdeasDataView ideas={ideas} />
      </Suspense>
    </div>
  );
}
