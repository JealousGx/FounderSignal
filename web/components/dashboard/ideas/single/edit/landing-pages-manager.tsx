"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { createMVP } from "./actions";
import { LandingPageCard } from "./landing-page-card";

import { DBUser } from "@/types/db-user";
import { LandingPage } from "@/types/idea";

interface LandingPagesManagerProps {
  mvps: LandingPage[];
  ideaId: string;
  user: DBUser;
}

export default function LandingPagesManager({
  mvps,
  ideaId,
  user,
}: LandingPagesManagerProps) {
  const getMVPLimit = () => {
    switch (user?.plan) {
      case "pro":
        return 5;
      case "business":
        return 20;
      default:
        return 1; // Starter plan or default case
    }
  };

  const onCreateMVP = async () => {
    const result = await createMVP(ideaId);
    if (result.error || !result.mvpId) {
      console.error("Error creating MVP:", result.error);
      return;
    }

    window.open(`/mvp/${ideaId}/edit?mvpId=${result.mvpId}`, "_blank");
  };

  const mvpLimit = getMVPLimit();
  const limitReached = mvps?.length >= mvpLimit;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {limitReached ? (
          <Tooltip>
            <TooltipTrigger>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create New Landing Page
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                You&apos;ve reached the limit of {mvpLimit} MVPs for your plan.
                <br />
                <Link href="/pricing" className="underline">
                  Upgrade your plan
                </Link>{" "}
                to create more.
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button onClick={onCreateMVP}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Landing Page
          </Button>
        )}
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
