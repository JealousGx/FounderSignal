"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";
import { useState } from "react";

interface EngagementMetricsProps {
  stats: any;
}

export default function EngagementMetrics({ stats }: EngagementMetricsProps) {
  // States to track active slice for each chart
  const [activeConfirmationIndex, setActiveConfirmationIndex] = useState<
    number | undefined
  >();
  const [activeIdeaIndex, setActiveIdeaIndex] = useState<number | undefined>();

  // Prepare data for the pie charts
  const conversionStatusData = [
    { name: "Confirmed", value: stats.confirmedSubscribers || 0 },
    {
      name: "Pending",
      value: stats.totalSubscribers - stats.confirmedSubscribers || 0,
    },
  ];

  const ideaDistributionData = [
    { name: "EcoTrack", value: 42 },
    { name: "RemoteTeamOS", value: 28 },
    { name: "SkillSwap", value: 18 },
    { name: "Other", value: 12 },
  ];

  // Colors for pie charts
  const COLORS = [
    "#22c55e",
    "#eab308",
    "#3b82f6",
    "#8b5cf6",
    "#f97316",
    "#6b7280",
  ];

  // Custom active shape for the pie slices
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // Make the active slice slightly larger
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#333" fontSize={14}>
          {`${payload.name}`}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#333" fontSize={12}>
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Subscription Status</CardTitle>
          <CardDescription>Confirmed vs pending subscribers</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  activeIndex={activeConfirmationIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveConfirmationIndex(index)}
                  onMouseLeave={() => setActiveConfirmationIndex(undefined)}
                >
                  {conversionStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} subscribers`, ""]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  payload={conversionStatusData.map((item, index) => ({
                    id: item.name,
                    type: "square",
                    value: `${item.name} (${item.value})`,
                    color: COLORS[index % COLORS.length],
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribution by Idea</CardTitle>
          <CardDescription>
            Which ideas are attracting subscribers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ideaDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  activeIndex={activeIdeaIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIdeaIndex(index)}
                  onMouseLeave={() => setActiveIdeaIndex(undefined)}
                >
                  {ideaDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} subscribers`, ""]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  payload={ideaDistributionData.map((item, index) => ({
                    id: item.name,
                    type: "square",
                    value: `${item.name} (${item.value})`,
                    color: COLORS[index % COLORS.length],
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Quick Stats</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Avg. signups per day:
              </span>
              <span className="font-medium">
                {(stats.newSubscribers / 30).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Most active idea:</span>
              <span className="font-medium">EcoTrack</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmation rate:</span>
              <span className="font-medium">
                {(
                  (stats.confirmedSubscribers / stats.totalSubscribers) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
