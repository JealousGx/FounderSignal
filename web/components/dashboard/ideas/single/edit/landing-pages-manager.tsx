import { Plus } from "lucide-react";

import { Link } from "@/components/ui/link";
import { LandingPageCard } from "./landing-page-card";

import { LandingPage } from "@/types/idea";

interface LandingPagesManagerProps {
  mvps: LandingPage[];
  ideaId: string;
}

export default function LandingPagesManager({
  mvps,
  ideaId,
}: LandingPagesManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href={`/mvp/${ideaId}/edit?new=true`} target="_blank">
          <Plus className="mr-2 h-4 w-4" />
          Create New Landing Page
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mvps?.map((mvp) => <LandingPageCard key={mvp.id} mvp={mvp} />)}
      </div>

      {(!mvps || mvps.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No landing pages created yet.</p>
          <p>Click the button above to create your first one.</p>
        </div>
      )}
    </div>
  );
}
