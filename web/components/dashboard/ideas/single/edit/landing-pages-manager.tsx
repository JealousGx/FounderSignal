"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
import { toast } from "sonner";

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
  const [isCreating, setIsCreating] = useState(false);

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
    if (isCreating) return; // Prevent multiple clicks

    if (mvps.length >= getMVPLimit()) {
      toast.error(
        `You have reached the limit of ${getMVPLimit()} landing pages for your plan. Upgrade to create more.`
      );

      return;
    }

    setIsCreating(true);

    const result = await createMVP(ideaId);
    if (result.error || !result.mvpId) {
      console.error("Error creating MVP:", result.error);
      return;
    }

    setIsCreating(false);

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
          <Button onClick={onCreateMVP} disabled={isCreating}>
            {isCreating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0a10 10 0 00-10 10h2zm2.93 5.07A8 8 0 0112 20v2a10 10 0 0010-10h-2a8 8 0 01-7.07 7.07zM12 4a8 8 0 018 8h2a10 10 0 00-10-10V4z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New Landing Page
              </>
            )}
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
