"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { Progress } from "@/components/ui/progress";

import { Report } from "@/types/report";

interface ConversionMetricsProps {
  report: Report;
}

export default function ConversionMetrics({ report }: ConversionMetricsProps) {
  const funnelData = [
    { name: "Views", value: report.views },
    { name: "Engaged", value: report.engagementRate },
    { name: "Signups", value: report.signups },
  ];

  const viewToEngagedRate =
    report.views > 0
      ? Math.round((funnelData[1].value / funnelData[0].value) * 100)
      : 0;
  const engagedToSignupRate =
    funnelData[1].value > 0
      ? Math.round((funnelData[2].value / funnelData[1].value) * 100)
      : 0;
  const overallConversionRate = report.conversionRate;

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Conversion Metrics</CardTitle>

        <CardDescription>From page views to successful signups</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Views"
              value={report.views}
              description="People who visited the landing page"
            />

            <MetricCard
              title="Total Signups"
              value={report.signups}
              description="People who signed up"
            />

            <MetricCard
              title="Conversion Rate"
              value={`${report.conversionRate}%`}
              description="Percentage of visitors who signed up"
            />
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Conversion Funnel</h4>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={funnelData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Views to Engaged</span>

                <span className="font-medium">{viewToEngagedRate}%</span>
              </div>

              <Progress value={viewToEngagedRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engaged to Signup</span>

                <span className="font-medium">{engagedToSignupRate}%</span>
              </div>

              <Progress value={engagedToSignupRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Conversion</span>

                <span className="font-medium">{overallConversionRate}%</span>
              </div>

              <Progress value={overallConversionRate} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="bg-muted rounded-md p-4">
      <h3 className="font-medium text-sm">{title}</h3>

      <p className="text-2xl font-bold mt-2 mb-1">{value}</p>

      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
