import {
  Calendar,
  ExternalLink,
  Eye,
  Pencil,
  Settings,
  Share2,
  ThumbsUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OptimizedImage } from "@/components/ui/image";
import { Link as CustomLink } from "@/components/ui/link";
import { UpdateCampaign } from "./campaign";
import { ShareIdeaUrl } from "./share";

import { Idea } from "@/types/idea";
import { formatDate, getStageBadgeColor, getStatusBadgeColor } from "../utils";

export function IdeaOverview({ idea }: { idea: Idea }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0">
            <OptimizedImage
              src={idea.imageUrl || "/assets/images/placeholder.webp"}
              alt={idea.title}
              width={96}
              height={96}
              objectFit="contain"
            />
          </div>

          <div className="flex-grow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge
                  className={`${getStatusBadgeColor(idea.status)} capitalize`}
                >
                  {idea.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${getStageBadgeColor(idea.stage)} capitalize`}
                >
                  {idea.stage}
                </Badge>
              </div>
              <div className="flex gap-2">
                <CustomLink
                  href={`/mvp/${idea.id}`}
                  target="_blank"
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Landing Page
                </CustomLink>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-white"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/ideas/${idea.id}/edit`}
                        className="cursor-pointer w-full"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Idea
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ShareIdeaUrl
                        ideaId={idea.id}
                        variant="ghost"
                        className="cursor-pointer justify-start w-full !px-2 py-1.5"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </ShareIdeaUrl>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <UpdateCampaign
                        ideaId={idea.id}
                        status={idea.status}
                        variant="ghost"
                        className="cursor-pointer justify-start w-full !px-2 py-1.5"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
              {idea.title}
            </CardTitle>
            <CardDescription className="mt-2 text-base line-clamp-3">
              {idea.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 border-t">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created
            </span>
            <span className="font-medium">{formatDate(idea.createdAt)}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Signups
            </span>
            <span className="font-medium">{idea.signups.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              Views
            </span>
            <span className="font-medium">{idea.views.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              Conversion
            </span>
            <span className="font-medium">
              {idea.views > 0
                ? `${Math.round((idea.signups / idea.views) * 100)}%`
                : "0%"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
