import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/image";
import { Link } from "@/components/ui/link";

import { Idea } from "@/types/idea";
import { getStatusBadgeColor } from "../../utils";

interface EditHeaderProps {
  idea: Idea;
}

export default function EditHeader({ idea }: EditHeaderProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <OptimizedImage
              src={idea.imageUrl || "/assets/images/placeholder.webp"}
              alt={idea.title}
              width={64}
              height={64}
              objectFit="contain"
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge
                className={`${getStatusBadgeColor(idea.status)} capitalize`}
              >
                {idea.status}
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold">
              {idea.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              size="sm"
              className="h-9 bg-white"
              variant="outline"
              href={`/mvp/${idea.id}`}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Preview Landing Page
            </Link>

            <Link
              size="sm"
              className="h-9"
              variant="default"
              href={`/mvp/${idea.id}/edit`}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Edit Landing Page
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
