import {
  Calendar,
  ExternalLink,
  Eye,
  PauseCircle,
  Pencil,
  PlayCircle,
  Settings,
  Share2,
  ThumbsUp,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OptimizedImage } from "@/components/ui/image";
import { Link as CustomLink } from "@/components/ui/link";

import { Idea } from "@/types/idea";
import { formatDate, getStageBadgeColor, getStatusBadgeColor } from "../utils";

export function IdeaOverview({ idea }: { idea: Idea }) {
  const isActive = idea.status === "active";

  return (
    <Card className="border-none overflow-hidden shadow-sm">
      <div className="w-full h-48 sm:h-56 md:h-64 relative">
        <OptimizedImage
          src={
            idea.imageUrl ||
            "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2000&auto=format&fit=crop"
          }
          alt={idea.title}
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${getStatusBadgeColor(idea.status)} capitalize`}>
              {idea.status}
            </Badge>
            <Badge
              variant="outline"
              className={`${getStageBadgeColor(idea.stage)} capitalize`}
            >
              {idea.stage}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {idea.title}
          </h1>

          <p className="text-white/80 text-sm md:text-base line-clamp-2">
            {idea.description}
          </p>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <CustomLink
            href={`/mvp/${idea.id}`}
            target="_blank"
            variant="secondary"
            size="sm"
            className="h-9"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Landing Page
          </CustomLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/ideas/${idea.id}/edit`}
                  className="cursor-pointer w-full"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Idea
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>

              {isActive ? (
                <DropdownMenuItem>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause Campaign
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Resume Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
              {Math.round((idea.signups / (idea.views || 1)) * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
