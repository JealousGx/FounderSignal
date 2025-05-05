import { Link } from "@/components/ui/link";
import { CalendarIcon, FileDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Report } from "@/types/report";

interface ReportHeaderProps {
  report: Report;
}

export default function ReportHeader({ report }: ReportHeaderProps) {
  // Define badge colors based on report type
  const getBadgeColor = () => {
    switch (report.type) {
      case "Weekly":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Monthly":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Milestone":
        return "bg-green-100 text-green-800 border-green-200";
      case "Final":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getBadgeColor()}>
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
              href={`/dashboard/ideas/${report.ideaId}`}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Idea
            </Link>

            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
