import { Link } from "@/components/ui/link";
import { Idea } from "@/types/idea";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface IdeaHeaderProps {
  idea: Idea;
}

export default function IdeaHeader({ idea }: IdeaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/ideas" variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <h1 className="font-semibold text-lg md:text-xl">Idea Details</h1>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/ideas/${idea.id}/edit`}
          variant="outline"
          size="sm"
        >
          Edit Idea
        </Link>
        <Link href={`/mvp/${idea.id}`} target="_blank" size="sm">
          <ExternalLink className="h-4 w-4 mr-1" />
          View Landing Page
        </Link>
      </div>
    </div>
  );
}
