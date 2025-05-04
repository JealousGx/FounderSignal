import {
  BarChart2,
  Eye,
  Pencil,
  Trash2,
  Pause,
  Play,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Idea } from "@/types/idea";

interface IdeaActionsProps {
  idea: Idea;
}

export function IdeaActions({ idea }: IdeaActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Link href={`/mvp/${idea.id}`} size="icon" variant="ghost">
        <Eye className="h-4 w-4" />

        <span className="sr-only">View</span>
      </Link>

      <Link href={`/dashboard/ideas/${idea.id}`} size="icon" variant="ghost">
        <BarChart2 className="h-4 w-4" />

        <span className="sr-only">Analytics</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          {idea.status === "Active" ? (
            <DropdownMenuItem>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          ) : idea.status === "Paused" ? (
            <DropdownMenuItem>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
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
          <Link variant="ghost" href={`/mvp/${idea.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View MVP
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        {idea.status === "Active" ? (
          <DropdownMenuItem>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        ) : idea.status === "Paused" ? (
          <DropdownMenuItem>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
