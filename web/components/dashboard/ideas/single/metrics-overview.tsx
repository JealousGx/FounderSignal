"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Idea } from "@/types/idea";

interface MetricsOverviewProps {
  idea: Idea;
}

export default function MetricsOverview({ idea }: MetricsOverviewProps) {
  // Normally you'd fetch this data from an API
  const chartData = generateChartData(idea);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Signups and views over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#8884d8"
                name="Views"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="#82ca9d"
                name="Signups"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function generateChartData(idea: Idea) {
  // This would normally come from your API
  // For now, we'll generate sample data
  const today = new Date();
  const days = 14;

  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (days - i - 1));
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Generate somewhat realistic data based on the idea's total values
    const dayFactor = 1 + Math.sin(i / (days / Math.PI)) * 0.5; // Creates a wave pattern
    const growthFactor = (i / days) * 1.5; // Shows growth over time
    const randomFactor = 0.7 + Math.random() * 0.6; // Adds randomness

    const viewsPerDay = Math.round(
      (idea.views / days) * dayFactor * growthFactor * randomFactor
    );
    const signupsPerDay = Math.round(
      (idea.signups / days) * dayFactor * growthFactor * randomFactor
    );

    return {
      date: dateStr,
      views: viewsPerDay,
      signups: signupsPerDay,
    };
  });
}
