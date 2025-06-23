import { CalendarIcon, ExternalLink, FileDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";

import { formatDate } from "@/lib/utils";
import { Report } from "@/types/report";

interface ReportHeaderProps {
  report: Report;
}

export default function ReportHeader({ report }: ReportHeaderProps) {
  const getBadgeColor = () => {
    switch (report.type) {
      case "weekly":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "monthly":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "milestone":
        return "bg-green-100 text-green-800 border-green-200";
      case "final":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getBadgeColor()} capitalize`}
              >
                {report.type} Report
              </Badge>

              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />

                {formatDate(report.date)}
              </div>
            </div>

            <h2 className="text-2xl font-bold">{report.idea?.title}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/ideas/${report.idea?.id}`}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Idea
            </Link>

            <Button variant="outline" size="sm" className="bg-white">
              <FileDown className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
