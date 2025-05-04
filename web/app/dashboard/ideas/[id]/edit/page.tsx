import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIdeaById } from "@/lib/api";
import EditHeader from "@/components/dashboard/ideas/single/edit/header";
import BasicDetailsForm from "@/components/dashboard/ideas/single/edit/basic-details-form";
import LandingPageForm from "@/components/dashboard/ideas/single/edit/landing-page-form";
import DangerZone from "@/components/dashboard/ideas/single/edit/danger-zone";

interface EditIdeaPageProps {
  params: {
    id: string;
  };
}

export default async function EditIdeaPage({ params }: EditIdeaPageProps) {
  const { id } = await params;
  const idea = await getIdeaById(id);

  if (!idea) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/ideas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-semibold text-lg md:text-xl">Edit Idea</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <EditHeader idea={idea} />
      </Suspense>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BasicDetailsForm idea={idea} />
          </Suspense>
        </TabsContent>

        <TabsContent value="landing">
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <LandingPageForm idea={idea} />
          </Suspense>
        </TabsContent>

        <TabsContent value="advanced">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <DangerZone ideaId={id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
