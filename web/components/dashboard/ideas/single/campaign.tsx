"use client";

import { PauseCircle, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button, ButtonProps } from "@/components/ui/button";
import { updateIdeaAttributes } from "./edit/actions";

import { Idea } from "@/types/idea";

type UpdateCampaignProps = ButtonProps & {
  ideaId: string;
  status: Idea["status"];
};

export const UpdateCampaign = ({
  ideaId,
  status,
  ...rest
}: UpdateCampaignProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const updateCampaign = async (campaign: Idea["status"]) => {
    setIsSaving(true);
    try {
      const response = await updateIdeaAttributes(ideaId, {
        status: campaign,
      });
      if (response.error) {
        return toast.error(response.error, {
          duration: 3000,
        });
      }

      toast.success(
        `Idea is now ${campaign === "active" ? "active" : "paused"}!`,
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error(
        (error as Error).message || "An error occurred while updating campaign"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "active") {
    return (
      <Button
        disabled={isSaving}
        variant="outline"
        onClick={() => updateCampaign("paused")}
        className="w-full gap-2"
        {...rest}
      >
        <PauseCircle className="w-4 h-4 mr-2" />
        Pause Campaign
      </Button>
    );
  }

  if (status === "paused") {
    return (
      <Button
        disabled={isSaving}
        variant="outline"
        onClick={() => updateCampaign("active")}
        className="w-full gap-2"
        {...rest}
      >
        <PlayCircle className="w-4 h-4 mr-2" />
        Resume Campaign
      </Button>
    );
  }

  return null;
};
