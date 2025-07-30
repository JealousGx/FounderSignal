import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import BasicDetailsForm from "@/components/dashboard/ideas/single/edit/basic-details-form";
import DangerZone from "@/components/dashboard/ideas/single/edit/danger-zone";
import EditHeader from "@/components/dashboard/ideas/single/edit/header";
import LandingPagesManager from "@/components/dashboard/ideas/single/edit/landing-pages-manager";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getIdea } from "../get-idea";
import { getUser } from "@/lib/auth";
import { LandingPage } from "@/types/idea";

interface EditIdeaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIdeaPage({ params }: EditIdeaPageProps) {
  const { id } = await params;

  const data = await getIdea(id, { withMVPs: true });
  const user = await getUser();

  if (!data) {
    notFound();
  }

  const idea = data?.idea;

  const activeMVPId = data?.mvps?.find((mvp: LandingPage) => mvp.isActive)?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link variant="ghost" size="icon" href={`/dashboard/ideas/${id}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-semibold text-lg md:text-xl">Edit Idea</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <EditHeader idea={idea} activeMVPId={activeMVPId} />
      </Suspense>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full md:w-auto h-auto flex-wrap mb-4 bg-gray-200">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="landing-pages">Landing Pages</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <BasicDetailsForm idea={idea} />
          </Suspense>
        </TabsContent>

        <TabsContent value="landing-pages">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <LandingPagesManager mvps={data.mvps} ideaId={id} user={user} />
          </Suspense>
        </TabsContent>

        <TabsContent value="advanced">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <DangerZone ideaId={id} ideaTitle={idea.title} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
