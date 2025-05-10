import React from "react";
import Ideas from "./ideas";
import { getIdeas } from "./get-ideas";

const DEFAULT_PAGE_SIZE = 2;

export default async function ExplorePage() {
  const initialData = await getIdeas(DEFAULT_PAGE_SIZE, 0);

  console.log("Initial data:", initialData);

  if (!initialData || initialData.totalCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          No Ideas Found
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mt-4">
          There are no startup ideas available at the moment. Please check back
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore Startup Ideas
          </h1>
          <div className="hidden md:block">
            <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-primary">
                Updated in real-time
              </span>
            </div>
          </div>
        </div>

        <p className="text-xl text-gray-600 max-w-3xl">
          Browse through validated startup ideas from our community of founders.
          Get inspired or analyze market validation results.
        </p>
      </div>

      <Ideas
        initialIdeas={initialData.ideas || []}
        initialTotalCount={initialData.totalCount || 0}
        defaultItemsPerPage={DEFAULT_PAGE_SIZE}
      />
    </div>
  );
}
