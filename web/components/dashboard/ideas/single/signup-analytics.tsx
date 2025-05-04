"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Idea } from "@/types/idea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SignupAnalyticsProps {
  idea: Idea;
}

export default function SignupAnalytics({ idea }: SignupAnalyticsProps) {
  const chartData = generateSourceData(idea);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup Sources</CardTitle>
        <CardDescription>Where your signups are coming from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={36}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Signups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function generateSourceData(idea: Idea) {
  // This would come from your API in a real app
  const totalSignups = idea.signups || 0;

  // Distribution of signups
  return [
    { name: "Direct", value: Math.round(totalSignups * 0.35) },
    { name: "Social", value: Math.round(totalSignups * 0.25) },
    { name: "Email", value: Math.round(totalSignups * 0.2) },
    { name: "Referral", value: Math.round(totalSignups * 0.15) },
    { name: "Other", value: Math.round(totalSignups * 0.05) },
  ];
}
