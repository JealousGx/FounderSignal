import { BarChart2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { EngagementIndicator } from "./engagement-indicator";

import { Idea } from "@/types/idea";
import { formatDate, getStageBadgeColor, getStatusBadgeColor } from "../utils";
import { IdeaCardActions } from "./actions";

interface IdeasGridViewProps {
  ideas: Idea[];
}

export default function IdeasGridView({ ideas }: IdeasGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {ideas.length > 0 ? (
        ideas.map((idea) => (
          <Card key={idea.id} className="overflow-hidden pt-0">
            <div className="h-[140px] w-full relative">
              {idea.imageUrl && idea.imageUrl !== "" && (
                <OptimizedImage
                  src={idea.imageUrl}
                  alt={idea.title}
                  fill
                  className="object-cover"
                />
              )}

              <div className="absolute top-2 right-2 flex gap-1">
                <Badge
                  className={`${getStatusBadgeColor(idea.status)} capitalize`}
                >
                  {idea.status}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2 flex-grow">
              <CardTitle className="text-lg">{idea.title}</CardTitle>

              <CardDescription className="line-clamp-2">
                {idea.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <Badge
                    variant="outline"
                    className={`${getStageBadgeColor(idea.stage)} capitalize`}
                  >
                    {idea.stage}
                  </Badge>
                </div>

                <div className="text-muted-foreground">
                  Updated {formatDate(idea.updatedAt)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <MetricDisplay
                  label="Signups"
                  value={idea.signups.toLocaleString()}
                />

                <MetricDisplay
                  label="Views"
                  value={idea.views.toLocaleString()}
                />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Engagement</p>

                  <p className="font-medium flex items-center justify-center">
                    {idea.engagementRate.toFixed(2)}%
                    <EngagementIndicator
                      rate={idea.engagementRate}
                      className="ml-0.5"
                    />
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 flex justify-between">
              <Link size="sm" href={`/dashboard/ideas/${idea.id}`}>
                <BarChart2 className="h-4 w-4 mr-1" />
                Analytics
              </Link>

              <IdeaCardActions idea={idea} />
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-4 flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-semibold text-gray-700">
            No ideas found.
          </h2>
          <p className="text-sm text-gray-500">
            You can create a new idea to get started.
          </p>
        </div>
      )}
    </div>
  );
}

interface MetricDisplayProps {
  label: string;
  value: string;
}

function MetricDisplay({ label, value }: MetricDisplayProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}
