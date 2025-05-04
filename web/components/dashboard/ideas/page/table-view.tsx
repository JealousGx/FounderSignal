import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusBadgeColor, getStageBadgeColor } from "../utils";
import { Idea } from "@/types/idea";
import { EngagementIndicator } from "./engagement-indicator";
import { IdeaActions } from "./actions";

interface IdeasTableViewProps {
  ideas: Idea[];
}

export default function IdeasTableView({ ideas }: IdeasTableViewProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Idea</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Signups</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Engagement</TableHead>
            <TableHead className="text-right">Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <TableRow key={idea.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      width={48}
                      height={48}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                      {idea.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeColor(idea.status)}
                >
                  {idea.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStageBadgeColor(idea.stage)}
                >
                  {idea.stage}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{idea.signups}</TableCell>
              <TableCell className="text-right">{idea.views}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {idea.engagementRate}%
                  <EngagementIndicator rate={idea.engagementRate} />
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {formatDate(idea.updatedAt)}
              </TableCell>
              <TableCell>
                <IdeaActions idea={idea} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
