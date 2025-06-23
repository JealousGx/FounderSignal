import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import BasicDetailsForm from "@/components/dashboard/ideas/single/edit/basic-details-form";
import DangerZone from "@/components/dashboard/ideas/single/edit/danger-zone";
import EditHeader from "@/components/dashboard/ideas/single/edit/header";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getIdea } from "../get-idea";

interface EditIdeaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIdeaPage({ params }: EditIdeaPageProps) {
  const { id } = await params;

  const data = await getIdea(id, { withMVP: true });

  if (!data) {
    notFound();
  }

  const idea = data?.idea;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link variant="ghost" size="icon" href={`/dashboard/ideas/${id}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-semibold text-lg md:text-xl">Edit Idea</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <EditHeader idea={idea} />
      </Suspense>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 mb-4 bg-gray-200">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BasicDetailsForm idea={idea} />
          </Suspense>
        </TabsContent>

        <TabsContent value="advanced">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <DangerZone ideaId={id} ideaTitle={idea.title} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
