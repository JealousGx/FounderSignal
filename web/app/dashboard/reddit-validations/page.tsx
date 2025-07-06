import { Suspense } from "react";

import { RedditValidationList } from "@/components/dashboard/reddit-validations/list";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function RedditValidationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reddit Validations</h1>
        <p className="text-muted-foreground">
          AI-powered market validation from Reddit conversations
        </p>
      </div>

      <Suspense fallback={<ValidationListSkeleton />}>
        <RedditValidationList />
      </Suspense>
    </div>
  );
}

function ValidationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
