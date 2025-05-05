import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Lightbulb,
  ArrowUpRight,
  CheckSquare,
  PlusCircle,
} from "lucide-react";
import { Link } from "@/components/ui/link";
import { Report } from "@/types/report";

interface ActionItemsProps {
  report: Report;
}

export default function ActionItems({ report }: ActionItemsProps) {
  // Generate insights based on report data
  const insights = generateInsights(report);

  // Generate action items based on the report data
  const actionItems = generateActionItems(report);

  return (
    <Card>
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
                  className="w-full justify-start text-left h-auto py-3 font-normal"
                >
                  <span>{item.text}</span>

                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </li>
            ))}
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-muted-foreground"
              >
                <PlusCircle className="h-4 w-4 mr-2" />

                <span>Create custom action</span>
              </Button>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function generateInsights(report: Report) {
  const insights = [];

  // Conversion rate insights
  if (report.conversionRate > 40) {
    insights.push(
      "Your conversion rate is exceptionally high compared to the industry average"
    );
  } else if (report.conversionRate < 20) {
    insights.push(
      "Your conversion rate is below average and might need improvement"
    );
  }

  // Signup growth insights
  if (report.signups > 200) {
    insights.push(
      "You've reached a significant number of signups, suggesting strong market interest"
    );
  } else if (report.signups < 50) {
    insights.push("The current signup count is relatively low for this stage");
  }

  // Add insight about validation status
  if (report.validated) {
    insights.push(
      "This idea has met all validation criteria and is ready to advance to the next stage"
    );
  } else {
    insights.push(
      "Additional validation is needed before moving to the next stage"
    );
  }

  return insights;
}

function generateActionItems(report: Report) {
  const items = [];

  // Always include these actions
  items.push({
    text: "Review landing page content",
    link: `/dashboard/ideas/${report.ideaId}/edit`,
  });

  // Add conditional actions based on the report data
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
