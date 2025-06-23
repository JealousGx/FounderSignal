import { notFound } from "next/navigation";
import { Suspense } from "react";

import FeedbackSection from "@/components/dashboard/ideas/single/feedback-section";
import IdeaHeader from "@/components/dashboard/ideas/single/header";
import MetricsOverview from "@/components/dashboard/ideas/single/metrics-overview";
import { IdeaOverview } from "@/components/dashboard/ideas/single/overview";
import { IdeaSettings } from "@/components/dashboard/ideas/single/settings";
import SignupAnalytics from "@/components/dashboard/ideas/single/signup-analytics";
import ValidationProgress from "@/components/dashboard/ideas/single/validation-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getIdea } from "./get-idea";

interface IdeaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params;

  const data = await getIdea(id, { withAnalytics: true });

  if (!data || !data.idea) {
    console.error("Idea not found or invalid data:", data);
    notFound();
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <IdeaHeader ideaId={id} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <IdeaOverview idea={data.idea} />
      </Suspense>

      <div className="space-y-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="bg-gray-200 w-full md:w-auto grid grid-cols-3 mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <MetricsOverview overview={data.analyticsData} />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                <SignupAnalytics idea={data.idea} />
              </Suspense>

              <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                <ValidationProgress idea={data.idea} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <FeedbackSection ideaId={id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <IdeaSettings idea={data.idea} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
