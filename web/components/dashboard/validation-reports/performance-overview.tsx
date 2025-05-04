"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, Users, MousePointerClick, ThumbsUp } from "lucide-react";
import { Report } from "@/types/report";
import { CircularProgressIndicator } from "@/components/ui/circular-progress-indicator";

interface PerformanceOverviewProps {
  reports: Report[];
}

export default function PerformanceOverview({
  reports,
}: PerformanceOverviewProps) {
  // Calculate overall metrics across all reports
  const totalSignups = reports.reduce((sum, report) => sum + report.signups, 0);
  const totalViews = reports.reduce((sum, report) => sum + report.views, 0);
  const avgSentiment =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + report.sentiment, 0) /
        reports.length
      : 0;

  // Percentage of reports with positive validation outcomes
  const successRate =
    reports.length > 0
      ? (reports.filter((r) => r.validated).length / reports.length) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Validation Success</CardTitle>
          <CardDescription>Overall validation rate</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-36 flex items-center justify-center">
            <div className="w-28 h-28">
              <CircularProgressIndicator
                percentage={Math.round(successRate)}
                size={112}
                strokeWidth={10}
                color={`rgba(62, 152, 199, ${successRate / 100})`}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Based on {reports.length} total reports
          </p>
        </CardContent>
      </Card>

      <MetricCard
        title="Total Signups"
        description="Across all campaigns"
        value={totalSignups}
        trend={12}
        icon={<Users className="h-4 w-4" />}
        color="green"
      />

      <MetricCard
        title="Page Views"
        description="Landing page impressions"
        value={totalViews}
        trend={8}
        icon={<MousePointerClick className="h-4 w-4" />}
        color="blue"
      />

      <MetricCard
        title="Average Sentiment"
        description="User feedback rating"
        value={`${(avgSentiment * 100).toFixed(0)}%`}
        trend={3}
        icon={<ThumbsUp className="h-4 w-4" />}
        color="amber"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  description: string;
  value: number | string;
  trend?: number;
  icon?: React.ReactNode;
  color?: "green" | "blue" | "amber" | "purple";
}

function MetricCard({
  title,
  description,
  value,
  trend = 0,
  icon,
  color = "blue",
}: MetricCardProps) {
  const colors = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className={`rounded-full p-2.5 ${colors[color]}`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {trend > 0 && (
          <p className="text-xs flex items-center text-green-600 font-medium mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            {trend}% increase
          </p>
        )}
      </CardContent>
    </Card>
  );
}
