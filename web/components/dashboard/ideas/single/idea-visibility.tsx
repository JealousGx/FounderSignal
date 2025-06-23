"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { updateIdeaAttributes } from "./edit/actions";

export const IdeaVisibility = ({
  ideaId,
  isPrivate: _isPrivate,
}: {
  ideaId: string;
  isPrivate: boolean;
}) => {
  const [isPrivate, setIsPrivate] = useState(_isPrivate);
  const [isSaving, setIsSaving] = useState(false);

  const handlePrivacyChange = async (checked: boolean) => {
    setIsSaving(true);
    try {
      const response = await updateIdeaAttributes(ideaId, {
        isPrivate: checked,
      });
      if (response.error) {
        return toast.error(response.error, {
          duration: 3000,
        });
      }
      setIsPrivate(checked);

      toast.success(`Idea is now ${checked ? "private" : "public"}!`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error(
        (error as Error).message ||
          "An error occurred while updating visibility"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>
          Control if your idea appears on the public Explore page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {isPrivate ? "Private Idea" : "Public Idea"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPrivate
                ? "Only people with the direct link can view."
                : "Visible to everyone on the Explore page."}
            </p>
          </div>
          <Switch
            checked={isPrivate}
            onCheckedChange={handlePrivacyChange}
            disabled={isSaving}
            aria-label="Toggle idea visibility"
          />
        </div>
      </CardContent>
    </Card>
  );
};
