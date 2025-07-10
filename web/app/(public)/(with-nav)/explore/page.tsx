import { Metadata } from "next";

import { getIdeas } from "./get-ideas";
import Ideas from "./ideas";

import { createMetadata } from "@/lib/metadata";

export const revalidate = 2 * 60 * 60; // 2 hours

export const metadata: Metadata = createMetadata({
  title: "Explore Startup Ideas",
  description:
    "Discover and analyze hundreds of startup ideas. See real-world validation metrics, user feedback, and market interest on FounderSignal.",
  urlPath: "explore",
});

const DEFAULT_PAGE_SIZE = 6;

export default async function ExplorePage() {
  const initialData = await getIdeas({ limit: DEFAULT_PAGE_SIZE, offset: 0 });

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
        initialIdeas={initialData?.ideas || []}
        initialTotalCount={initialData?.totalCount || 0}
        defaultItemsPerPage={DEFAULT_PAGE_SIZE}
      />
    </div>
  );
}
