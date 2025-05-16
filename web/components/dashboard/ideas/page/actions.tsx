import { BarChart2, Eye, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as CustomLink } from "@/components/ui/link";

import { Idea } from "@/types/idea";

interface IdeaActionsProps {
  idea: Idea;
}

export function IdeaActions({ idea }: IdeaActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <CustomLink href={`/mvp/${idea.id}`} size="icon" variant="ghost">
        <Eye className="h-4 w-4" />

        <span className="sr-only">View</span>
      </CustomLink>

      <CustomLink
        href={`/dashboard/ideas/${idea.id}`}
        size="icon"
        variant="ghost"
      >
        <BarChart2 className="h-4 w-4" />

        <span className="sr-only">Analytics</span>
      </CustomLink>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/ideas/${idea.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          {/* {idea.status === "active" ? (
            <DropdownMenuItem>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          ) : idea.status === "paused" ? (
            <DropdownMenuItem>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function IdeaCardActions({ idea }: IdeaActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <CustomLink variant="ghost" href={`/mvp/${idea.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View MVP
          </CustomLink>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/ideas/${idea.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>

        {/* {idea.status === "active" ? (
          <DropdownMenuItem>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        ) : idea.status === "paused" ? (
          <DropdownMenuItem>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
