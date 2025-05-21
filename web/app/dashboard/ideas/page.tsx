import { Suspense } from "react";

import IdeasDataView from "@/components/dashboard/ideas/page/data-view";
import IdeasPageHeader from "@/components/dashboard/ideas/page/header";
import IdeasStatCards from "@/components/dashboard/ideas/page/stat-cards";
import { Skeleton } from "@/components/ui/skeleton";

import { getUserIdeas } from "./get-ideas";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const data = await getUserIdeas(true, { limit: 10, offset: 0 });

  return (
    <div className="space-y-6">
      <IdeasPageHeader />

      {!data && (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-semibold text-gray-700">
            Something went wrong.
          </h2>
          <p className="text-sm text-gray-500">Please try again later.</p>
        </div>
      )}

      {data.ideas.length > 0 ? (
        <>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            }
          >
            <IdeasStatCards total={data.total} stats={data.stats} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <IdeasDataView initialIdeas={data.ideas} totalIdeas={data.total} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-semibold text-gray-700">
            No ideas found.
          </h2>
          <p className="text-sm text-gray-500">
            You can create a new idea to get started.
          </p>
        </div>
      )}
    </div>
  );
}
