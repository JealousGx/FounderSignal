"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Report } from "@/types/report";

interface ReportOverviewProps {
  report: Report;
  overview: {
    date: string;
    views: number;
    signups: number;
  }[];
}

export default function ReportOverview({
  report,
  overview,
}: ReportOverviewProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>

        <CardDescription>Signup and view metrics over time</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={overview}
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
