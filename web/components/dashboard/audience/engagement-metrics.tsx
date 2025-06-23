"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AudienceStats } from "@/types/audience";
import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

interface EngagementMetricsProps {
  stats: AudienceStats;
  metrics: {
    name: string;
    value: number;
  }[];
}

export default function EngagementMetrics({
  stats,
  metrics,
}: EngagementMetricsProps) {
  // State to track active slice for the idea distribution chart
  const [activeIdeaIndex, setActiveIdeaIndex] = useState<number | undefined>();

  // Colors for pie charts
  const COLORS = [
    "#22c55e",
    "#eab308",
    "#3b82f6",
    "#8b5cf6",
    "#f97316",
    "#6b7280",
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
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
                  data={metrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  activeIndex={activeIdeaIndex}
                  activeShape={(props: PieSectorDataItem) => {
                    const {
                      cx,
                      cy = 0,
                      innerRadius,
                      outerRadius = 0,
                      startAngle,
                      endAngle,
                      fill,
                      payload,
                      percent = 0,
                      value,
                    } = props;

                    return (
                      <g>
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius}
                          outerRadius={outerRadius + 3} // Make the active slice slightly larger
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                        />
                        <text
                          x={cx}
                          y={cy - 7}
                          textAnchor="middle"
                          fill="#333"
                          fontSize={12}
                        >
                          {`${payload.name}`}
                        </text>
                        <text
                          x={cx}
                          y={cy + 10}
                          textAnchor="middle"
                          fill="#555"
                          fontSize={10}
                        >
                          {`${value} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      </g>
                    );
                  }}
                  onMouseEnter={(_, index) => setActiveIdeaIndex(index)}
                  onMouseLeave={() => setActiveIdeaIndex(undefined)}
                >
                  {metrics.map((entry, index) => (
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
                  payload={metrics.map((item, index) => ({
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

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Quick Stats</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Avg. signups per day:
              </span>
              <span className="font-medium">
                {(stats.newSubscribers / 30).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Most active idea:</span>
              {/* 0th item in metrics array will have the most signups, hence, most active. */}
              <span className="font-medium">{metrics[0].name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Conversion rate:</span>
              <span className="font-medium">
                {stats.averageConversionRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
