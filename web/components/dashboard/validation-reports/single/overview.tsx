"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Report } from "@/types/report";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReportOverviewProps {
  report: Report;
}

export default function ReportOverview({ report }: ReportOverviewProps) {
  // Generate sample data for the past 14 days
  const chartData = generateTimelineData(report);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>

        <CardDescription>Signup and view metrics over time</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis yAxisId="left" />

              <YAxis yAxisId="right" orientation="right" />

              <Tooltip />

              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                name="Page Views"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            This report shows a total of {report.views} page views and{" "}
            {report.signups} signups with a conversion rate of{" "}
            {report.conversionRate}%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function generateTimelineData(report: Report) {
  // For demo purposes, we'll generate daily data leading up to the report date
  const reportDate = new Date(report.date);
  const data = [];

  // Generate data for 14 days before the report date
  for (let i = 13; i >= 0; i--) {
    const date = new Date(reportDate);
    date.setDate(date.getDate() - i);

    // For a realistic pattern:
    // - views gradually increase
    // - signups follow with some delay
    // - ensure final day matches the report's totals

    const dayFactor = i === 0 ? 1 : (14 - i) / 14;
    const randomFactor = 0.7 + Math.random() * 0.6;

    let viewsForDay, signupsForDay;

    if (i === 0) {
      // Last day should match the report totals
      const previousViews = data.reduce((sum, d) => sum + d.views, 0);
      const previousSignups = data.reduce((sum, d) => sum + d.signups, 0);
      viewsForDay = Math.max(1, report.views - previousViews);
      signupsForDay = Math.max(0, report.signups - previousSignups);
    } else {
      viewsForDay = Math.round((report.views / 20) * dayFactor * randomFactor);
      signupsForDay = Math.round(
        (report.signups / 25) * dayFactor * randomFactor
      );
    }

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views: viewsForDay,
      signups: signupsForDay,
    });
  }

  return data;
}
