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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface NotificationSettingsProps {
  userId: string;
  settings: any;
}

export default function NotificationSettings({
  userId,
  settings,
}: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email_marketing: settings?.notifications?.email_marketing ?? true,
    email_updates: settings?.notifications?.email_updates ?? true,
    email_validation: settings?.notifications?.email_validation ?? true,
    weekly_summary: settings?.notifications?.weekly_summary ?? true,
    idea_comments: settings?.notifications?.idea_comments ?? true,
  });

  const handleToggle = (setting: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      // In a real app, this would save to the backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notification preferences");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="email_updates" className="flex flex-col gap-1">
                <span>Product updates</span>
                <span className="font-normal text-muted-foreground text-xs">
                  New features and improvements to the platform.
                </span>
              </Label>
              <Switch
                id="email_updates"
                checked={notifications.email_updates}
                onCheckedChange={(value) =>
                  handleToggle("email_updates", value)
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <Label htmlFor="email_validation" className="flex flex-col gap-1">
                <span>Validation results</span>
                <span className="font-normal text-muted-foreground text-xs">
                  Get notified when your validation metrics hit key thresholds.
                </span>
              </Label>
              <Switch
                id="email_validation"
                checked={notifications.email_validation}
                onCheckedChange={(value) =>
                  handleToggle("email_validation", value)
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <Label htmlFor="weekly_summary" className="flex flex-col gap-1">
                <span>Weekly summary</span>
                <span className="font-normal text-muted-foreground text-xs">
                  Receive a weekly digest of your validation progress.
                </span>
              </Label>
              <Switch
                id="weekly_summary"
                checked={notifications.weekly_summary}
                onCheckedChange={(value) =>
                  handleToggle("weekly_summary", value)
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <Label htmlFor="email_marketing" className="flex flex-col gap-1">
                <span>Marketing emails</span>
                <span className="font-normal text-muted-foreground text-xs">
                  Receive tips, resources, and special offers.
                </span>
              </Label>
              <Switch
                id="email_marketing"
                checked={notifications.email_marketing}
                onCheckedChange={(value) =>
                  handleToggle("email_marketing", value)
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">System Notifications</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="idea_comments" className="flex flex-col gap-1">
                <span>Idea comments</span>
                <span className="font-normal text-muted-foreground text-xs">
                  Get notified when someone comments on your ideas.
                </span>
              </Label>
              <Switch
                id="idea_comments"
                checked={notifications.idea_comments}
                onCheckedChange={(value) =>
                  handleToggle("idea_comments", value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
