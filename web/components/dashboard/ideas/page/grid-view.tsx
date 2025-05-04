import Image from "next/image";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusBadgeColor, getStageBadgeColor } from "../utils";
import { EngagementIndicator } from "./engagement-indicator";
import { Idea } from "@/types/idea";
import { IdeaCardActions } from "./actions";

interface IdeasGridViewProps {
  ideas: Idea[];
}

export default function IdeasGridView({ ideas }: IdeasGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {ideas.map((idea) => (
        <Card key={idea.id} className="overflow-hidden pt-0">
          <div className="h-[140px] w-full relative">
            <Image
              src={idea.imageUrl}
              alt={idea.title}
              fill
              className="object-cover"
            />

            <div className="absolute top-2 right-2 flex gap-1">
              <Badge className={getStatusBadgeColor(idea.status)}>
                {idea.status}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-2">
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
                  className={getStageBadgeColor(idea.stage)}
                >
                  {idea.stage}
                </Badge>
              </div>

              <div className="text-muted-foreground">
                Updated {formatDate(idea.updatedAt)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <MetricDisplay label="Signups" value={idea.signups} />

              <MetricDisplay label="Views" value={idea.views} />

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="font-medium flex items-center justify-center">
                  {idea.engagementRate}%
                  <EngagementIndicator
                    rate={idea.engagementRate}
                    className="ml-0.5"
                  />
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex justify-between">
            <Button size="sm" asChild>
              <Link href={`/dashboard/ideas/${idea.id}`}>
                <BarChart2 className="h-4 w-4 mr-1" />
                Analytics
              </Link>
            </Button>

            <IdeaCardActions idea={idea} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

interface MetricDisplayProps {
  label: string;
  value: number;
}

function MetricDisplay({ label, value }: MetricDisplayProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}
