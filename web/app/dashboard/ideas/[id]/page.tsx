import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIdeaById } from "@/lib/api";
// import IdeaAnalytics from "@/components/dashboard/ideas/idea-analytics";
import IdeaHeader from "@/components/dashboard/ideas/single/header";
import MetricsOverview from "@/components/dashboard/ideas/single/metrics-overview";
import SignupAnalytics from "@/components/dashboard/ideas/single/signup-analytics";
import ValidationProgress from "@/components/dashboard/ideas/single/validation-progress";
import FeedbackSection from "@/components/dashboard/ideas/single/feedback-section";
import { IdeaSettings } from "@/components/dashboard/ideas/single/settings";
import { IdeaOverview } from "@/components/dashboard/ideas/single/overview";

interface IdeaPageProps {
  params: {
    id: string;
  };
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params;
  const idea = await getIdeaById(id);

  if (!idea) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <IdeaHeader idea={idea} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <IdeaOverview idea={idea} />
      </Suspense>

      <div className="space-y-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <MetricsOverview idea={idea} />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                <SignupAnalytics idea={idea} />
              </Suspense>

              <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                <ValidationProgress idea={idea} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <FeedbackSection ideaId={idea.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <IdeaSettings idea={idea} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
