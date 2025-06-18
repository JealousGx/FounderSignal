import { Edit, ExternalLink, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { UpdateCampaign } from "./campaign";
import { IdeaVisibility } from "./idea-visibility";
import { ShareIdeaUrl } from "./share";

import { Idea } from "@/types/idea";
import { getStatusBadgeColor } from "../utils";

export function IdeaSettings({ idea }: { idea: Idea }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Idea Settings</CardTitle>
          <CardDescription>
            Configure your idea&apos;s details and landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/dashboard/ideas/${idea.id}/edit`}
                className="w-full gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Idea Details
              </Link>
              <Link
                href={`/dashboard/ideas/${idea.id}/edit`}
                className="w-full gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Landing Page
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/mvp/${idea.id}`}
                target="_blank"
                variant="outline"
                className="w-full gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Preview Landing Page
              </Link>

              <ShareIdeaUrl
                ideaId={idea.id}
                variant="outline"
                className="w-full gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Idea
              </ShareIdeaUrl>
            </div>
          </div>
        </CardContent>
      </Card>

      <IdeaVisibility ideaId={idea.id} isPrivate={idea.isPrivate} />

      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>Control your validation campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Current Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Your campaign is {idea.status.toLowerCase()}
                  </p>
                </div>
                <Badge
                  className={`${getStatusBadgeColor(idea.status)} capitalize`}
                >
                  {idea.status}
                </Badge>
              </div>
            </div>

            <UpdateCampaign ideaId={idea.id} status={idea.status} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
