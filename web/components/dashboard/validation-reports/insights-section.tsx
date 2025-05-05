"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  Users,
  MousePointerClick,
  Target,
} from "lucide-react";
import { Link } from "@/components/ui/link";
import { Report } from "@/types/report";

interface InsightsSectionProps {
  reports: Report[];
}

export default function InsightsSection({ reports }: InsightsSectionProps) {
  // Process reports data for charts
  const conversionData = reports
    .map((report) => ({
      name: formatShortTitle(report.idea?.title as string),
      value: report.conversionRate,
      id: report.ideaId,
      fullTitle: report.idea?.title,
    }))
    .sort((a, b) => b.value - a.value);

  const successData = [
    { name: "Validated", value: reports.filter((r) => r.validated).length },
    {
      name: "Not Validated",
      value: reports.filter((r) => !r.validated).length,
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const recentInsights = reports
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Converting Ideas
                </CardTitle>

                <CardDescription>
                  Conversion rates across your ideas
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conversionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />

                  <YAxis
                    label={{
                      value: "Conversion Rate (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" },
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [`${value}%`, "Conversion Rate"]}
                    labelFormatter={(label, data) =>
                      data[0]?.payload?.fullTitle || label
                    }
                  />

                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {conversionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Validation Outcomes
                </CardTitle>

                <CardDescription>
                  Success rate of your validation projects
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      name,
                    }) => {
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x =
                        cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y =
                        cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={12}
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {successData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#22c55e" : "#94a3b8"}
                      />
                    ))}
                  </Pie>

                  <Legend />

                  <Tooltip formatter={(value) => [`${value} reports`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Based on {reports.length} validation reports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Key Insights</CardTitle>

          <CardDescription>
            Important findings from your latest validation reports
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className="border-b pb-5 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-full p-2 ${getInsightIconColor(
                      insight
                    )}`}
                  >
                    {getInsightIcon(insight)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-base mb-1">
                          {getInsightTitle(insight)}
                        </h3>

                        <p className="text-muted-foreground text-sm">
                          From {insight.idea?.title} •{" "}
                          {formatDate(insight.date)}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={getInsightBadgeColor(insight)}
                      >
                        {insight.type} Report
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm">
                      {generateInsightDescription(insight)}
                    </p>

                    <div className="mt-4">
                      <Link
                        href={`/dashboard/reports/${insight.id}`}
                        variant="outline"
                        size="sm"
                      >
                        View full report
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {recentInsights.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">
                No insights available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getInsightIcon(insight: Partial<Report>) {
  const icons = {
    "high-conversion": <MousePointerClick className="h-4 w-4" />,
    "user-milestone": <Users className="h-4 w-4" />,
    "validation-complete": <Target className="h-4 w-4" />,
  };

  return (
    icons[getInsightType(insight) as keyof typeof icons] || (
      <TrendingUp className="h-4 w-4" />
    )
  );
}

function getInsightIconColor(insight: Partial<Report>) {
  const colors = {
    "high-conversion": "bg-blue-50 text-blue-600",
    "user-milestone": "bg-green-50 text-green-600",
    "validation-complete": "bg-amber-50 text-amber-600",
  };

  return (
    colors[getInsightType(insight) as keyof typeof colors] ||
    "bg-purple-50 text-purple-600"
  );
}

function getInsightBadgeColor(insight: Partial<Report>) {
  const colors = {
    Weekly: "bg-blue-50 text-blue-600 border-blue-200",
    Monthly: "bg-purple-50 text-purple-600 border-purple-200",
    Milestone: "bg-green-50 text-green-600 border-green-200",
    Final: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    colors[insight.type as keyof typeof colors] ||
    "bg-gray-50 text-gray-600 border-gray-200"
  );
}

function getInsightType(insight: Partial<Report>) {
  if (insight.conversionRate && insight.conversionRate > 50)
    return "high-conversion";

  if (insight.signups && insight.signups > 100) return "user-milestone";

  if (insight.validated) return "validation-complete";

  return "general";
}

function getInsightTitle(insight: Partial<Report>) {
  const type = getInsightType(insight);

  switch (type) {
    case "high-conversion":
      return `High conversion rate of ${insight.conversionRate}% achieved`;
    case "user-milestone":
      return `Milestone reached: ${insight.signups} signups`;
    case "validation-complete":
      return "Validation criteria successfully met";
    default:
      return `${insight.type} report for ${insight.idea?.title}`;
  }
}

function generateInsightDescription(insight: Partial<Report>) {
  const type = getInsightType(insight);

  switch (type) {
    case "high-conversion":
      return `Your landing page is performing exceptionally well with a conversion rate of ${
        insight.conversionRate
      }%. This is ${
        (insight.conversionRate || 0) - 10
      }% higher than the average for similar products.`;
    case "user-milestone":
      return `You've reached ${insight.signups} signups, which is a significant milestone in your validation journey. This indicates strong initial interest in your idea.`;
    case "validation-complete":
      return `Congratulations! Your idea has met the validation criteria with ${insight.signups} signups and a conversion rate of ${insight.conversionRate}%. You're ready to move to the next stage.`;
    default:
      return `This report contains important metrics and insights about your idea's performance, including ${insight.signups} total signups and a ${insight.conversionRate}% conversion rate.`;
  }
}

function formatShortTitle(title: string) {
  return title.length > 12 ? title.substring(0, 12) + "..." : title;
}
