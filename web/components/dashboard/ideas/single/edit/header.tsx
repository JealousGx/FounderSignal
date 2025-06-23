import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/image";
import { Link } from "@/components/ui/link";

import { Idea } from "@/types/idea";
import { getStatusBadgeColor } from "../../utils";

interface EditHeaderProps {
  idea: Idea;
}

export default function EditHeader({ idea }: EditHeaderProps) {
  return (
    <Card className="border-none overflow-hidden shadow-sm pb-0">
      <div className="relative h-32 md:h-40 w-full flex items-end">
        <OptimizedImage
          src={idea.imageUrl || "/placeholder-idea.jpg"}
          alt={idea.title}
          fill
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        <div className="relative p-4 md:p-6 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge
                  className={`${getStatusBadgeColor(idea.status)} capitalize`}
                >
                  {idea.status}
                </Badge>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mb-0">
                {idea.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                size="sm"
                className="h-9"
                variant="secondary"
                href={`/mvp/${idea.id}`}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Preview Landing Page
              </Link>

              <Link
                size="sm"
                className="h-9 ml-2"
                variant="default"
                href={`/mvp/${idea.id}/edit`}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Edit Landing Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
