import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getRedditValidation } from "@/components/dashboard/reddit-validations/actions";
import { DetailedReport } from "@/components/dashboard/reddit-validations/detailed-report";
import { Skeleton } from "@/components/ui/skeleton";

interface RedditValidationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RedditValidationPage({
  params,
}: RedditValidationPageProps) {
  const { id } = await params;

  try {
    const validation = await getRedditValidation(id);

    if (!validation) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {validation.ideaTitle}
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of Reddit conversations
            </p>
          </div>
        </div>

        <Suspense fallback={<ValidationReportSkeleton />}>
          <DetailedReport validation={validation} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Failed to load validation:", error);
    notFound();
  }
}

function ValidationReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
