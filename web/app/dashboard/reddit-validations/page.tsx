import { Suspense } from "react";

import { getRedditValidations } from "@/components/dashboard/reddit-validations/actions";
import { RedditValidationList } from "@/components/dashboard/reddit-validations/list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 6;

export default async function RedditValidationPage() {
  const data = await getRedditValidations({ limit: ITEMS_PER_PAGE });

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
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </Suspense>
    </div>
  );
}

function ValidationListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="mt-4 h-10 w-full rounded-md bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
