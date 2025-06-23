import {
  ArrowUpRight,
  CheckSquare,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";

import { Report } from "@/types/report";

interface ActionItemsProps {
  report: Report;
  insights: string[];
}

export default function ActionItems({ report, insights }: ActionItemsProps) {
  const actionItems = generateActionItems(report);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle>Next Steps</CardTitle>

        <CardDescription>
          Recommended actions based on this report
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {insights.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
              Key Insights
            </h4>

            <ul className="space-y-2 text-sm">
              {insights.map((insight, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mt-0.5" />

                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <CheckSquare className="h-4 w-4 mr-1 text-green-600" />
            Suggested Actions
          </h4>

          <ul className="space-y-3">
            {actionItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.link}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 font-normal bg-white"
                >
                  <span>{item.text}</span>

                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </li>
            ))}
            {/* <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-muted-foreground"
              >
                <PlusCircle className="h-4 w-4 mr-2" />

                <span>Create custom action</span>
              </Button>
            </li> */}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function generateActionItems(report: Report) {
  const items = [];

  // Always include these actions
  items.push({
    text: "Review landing page content",
    link: `/dashboard/ideas/${report.ideaId}/edit`,
  });

  if (report.conversionRate < 25) {
    items.push({
      text: "Improve your value proposition",
      link: `/dashboard/ideas/${report.ideaId}/edit?tab=landing`,
    });
  }

  if (!report.validated) {
    items.push({
      text: "Set up additional validation experiments",
      link: `/dashboard/ideas/${report.ideaId}?action=validate`,
    });
  }

  if (report.validated) {
    items.push({
      text: "Prepare for MVP development",
      link: `/dashboard/ideas/${report.ideaId}?action=mvp`,
    });
  }

  return items;
}
