"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Report } from "@/types/report";

interface TimelineDataProps {
  report: Report;
}

export default function TimelineData({ report }: TimelineDataProps) {
  const reportDate = new Date(report.date);

  // Generate daily and weekly data
  const dailyData = generateDailyData(reportDate, report);
  const weeklyData = generateWeeklyData(reportDate, report);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Analysis</CardTitle>

        <CardDescription>Performance data over time</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>

            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 25,
                  }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="signups" name="Signups" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="week" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="signups" name="Signups" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function generateDailyData(reportDate: Date, report: Report) {
  // Generate the last 7 days of data
  const data = [];
  const totalSignupsToDistribute = report.signups;

  // Create random but reasonable distribution across days
  const dailySignups = [];
  for (let i = 0; i < 7; i++) {
    const randomFactor = 0.5 + Math.random();
    dailySignups.push(randomFactor);
  }

  const sumFactors = dailySignups.reduce((sum, factor) => sum + factor, 0);

  // Normalize to ensure total adds up to report.signups
  const normalizedSignups = dailySignups.map((factor) =>
    Math.round((factor / sumFactors) * totalSignupsToDistribute)
  );

  // Adjust last day to make sure sum matches exactly
  const sumSignups = normalizedSignups.reduce((sum, val) => sum + val, 0);
  normalizedSignups[normalizedSignups.length - 1] +=
    totalSignupsToDistribute - sumSignups;

  // Create the data entries
  for (let i = 6; i >= 0; i--) {
    const date = new Date(reportDate);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      signups: normalizedSignups[6 - i],
    });
  }

  return data;
}

function generateWeeklyData(reportDate: Date, report: Report) {
  // Generate the last 4 weeks of data
  const data = [];
  const totalSignupsToDistribute = report.signups;

  // Create a distribution that shows growth trend
  const weeklyDistribution = [0.1, 0.2, 0.3, 0.4]; // Growth trend

  // Normalize to ensure total adds up to report.signups
  const sumFactors = weeklyDistribution.reduce(
    (sum, factor) => sum + factor,
    0
  );
  const weeklySignups = weeklyDistribution.map((factor) =>
    Math.round((factor / sumFactors) * totalSignupsToDistribute)
  );

  // Adjust last week to make sure sum matches exactly
  const sumSignups = weeklySignups.reduce((sum, val) => sum + val, 0);
  weeklySignups[weeklySignups.length - 1] +=
    totalSignupsToDistribute - sumSignups;

  // Create the data entries
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(reportDate);
    weekStart.setDate(weekStart.getDate() - ((3 - i) * 7 + 6));

    const weekEnd = new Date(reportDate);
    weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7);

    data.push({
      week: `Week ${i + 1}`,
      signups: weeklySignups[i],
      period: `${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
    });
  }

  return data;
}
