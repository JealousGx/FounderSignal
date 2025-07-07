import { Suspense } from "react";

import { getRedditValidations } from "@/components/dashboard/reddit-validations/actions";
import { RedditValidationList } from "@/components/dashboard/reddit-validations/list";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function RedditValidationPage() {
  const data = await getRedditValidations({ limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reddit Validations</h1>
        <p className="text-muted-foreground">
          AI-powered market validation from Reddit conversations
        </p>
      </div>

      <Suspense fallback={<ValidationListSkeleton />}>
        <RedditValidationList
          validations={data.validations}
          total={data.total}
        />
      </Suspense>
    </div>
  );
}

function ValidationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
