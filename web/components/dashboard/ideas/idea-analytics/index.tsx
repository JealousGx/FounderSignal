"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Idea, IdeaAnalytics as IIdeaAnalytics } from "@/types/idea";
import { AnalyticsDataPoint } from "@/types/analytics";

// Function to generate mock analytics data for an idea
const generateIdeaAnalyticsData = (idea: Idea): IIdeaAnalytics => {
  // Create 7 days of sample data
  const dataPoints: AnalyticsDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 7 days including today

  let totalViews = 0;
  let totalSignups = 0;

  // Ensure we have valid numbers to work with
  const ideaViews =
    typeof idea.views === "number" && !isNaN(idea.views) ? idea.views : 0;
  const ideaSignups =
    typeof idea.signups === "number" && !isNaN(idea.signups) ? idea.signups : 0;

  // Generate daily data points with a realistic distribution
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // Create a realistic distribution with slightly random growth
    const dayFactor = 0.7 + i / 10 + Math.random() * 0.3; // More views/signups as days progress

    // If we have no views/signups, generate some sample data
    let viewsForDay = 0;
    let signupsForDay = 0;

    if (ideaViews > 0) {
      viewsForDay = Math.round((ideaViews / 15) * dayFactor);
    } else {
      // Generate some sample data if no views exist
      viewsForDay = Math.round(10 * dayFactor);
    }

    if (ideaSignups > 0) {
      signupsForDay = Math.round((ideaSignups / 15) * dayFactor);
    } else {
      // Generate some sample data if no signups exist
      signupsForDay = Math.round(3 * dayFactor);
    }

    const conversionRate =
      viewsForDay > 0
        ? Math.round((signupsForDay / viewsForDay) * 100 * 10) / 10
        : 0;

    totalViews += viewsForDay;
    totalSignups += signupsForDay;

    dataPoints.push({
      date: currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views: viewsForDay,
      signups: signupsForDay,
      conversionRate,
    });
  }

  // Calculate the average conversion rate
  const averageConversionRate =
    totalViews > 0
      ? Math.round((totalSignups / totalViews) * 100 * 10) / 10
      : 0;

  return {
    ideaId: idea.id,
    idea,
    timeframe: "day",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    dataPoints,
    totals: {
      views: totalViews,
      signups: totalSignups,
      averageConversionRate,
    },
  };
};
export default function IdeaAnalytics({ ideas }: { ideas: Idea[] }) {
  const [selectedIdea, setSelectedIdea] = useState(
    ideas.length > 0 ? ideas[0].id : ""
  );
  const [isMobile, setIsMobile] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<IIdeaAnalytics | null>(
    null
  );

  // Handle window resize to determine if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Generate analytics data when selected idea changes
  useEffect(() => {
    if (selectedIdea) {
      const currentIdea = ideas.find((idea) => idea.id === selectedIdea);
      if (currentIdea) {
        const data = generateIdeaAnalyticsData(currentIdea);
        setAnalyticsData(data);
      }
    }
  }, [selectedIdea, ideas]);

  const formatTickForMobile = (value: string) => {
    if (isMobile && analyticsData && analyticsData.dataPoints.length > 5) {
      return value.length > 3 ? value.substring(0, 3) : value;
    }
    return value;
  };

  // If no ideas are available, show a message
  if (ideas.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium mb-2">No ideas available</h2>
          <p className="text-sm text-gray-500">
            Create an idea to view analytics data
          </p>
        </div>
      </Card>
    );
  }

  // If analytics data is not yet loaded
  if (!analyticsData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium">Loading analytics...</h2>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg font-bold">Idea Performance</h2>

        <p className="text-xs md:text-sm text-gray-600">
          Tracking views and signups over time
        </p>
      </div>

      <div className="mb-4 md:mb-6">
        <div className="mb-4 md:mb-6">
          <Select value={selectedIdea} onValueChange={setSelectedIdea}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an idea" />
            </SelectTrigger>
            <SelectContent>
              {ideas.map((idea) => (
                <SelectItem key={idea.id} value={idea.id}>
                  {idea.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="line" className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line">
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.dataPoints}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTickForMobile}
                />

                <YAxis tick={{ fontSize: 12 }} width={30} />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "conversionRate") {
                      return [`${value}%`, "Conversion Rate"];
                    }
                    return [value, name === "views" ? "Views" : "Signups"];
                  }}
                />

                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />

                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  name="Views"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />

                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="#82ca9d"
                  name="Signups"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="bar">
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.dataPoints}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTickForMobile}
                />

                <YAxis tick={{ fontSize: 12 }} width={30} />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "conversionRate") {
                      return [`${value}%`, "Conversion Rate"];
                    }
                    return [value, name === "views" ? "Views" : "Signups"];
                  }}
                />

                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />

                <Bar
                  dataKey="views"
                  fill="#8884d8"
                  name="Views"
                  barSize={isMobile ? 15 : 20}
                />

                <Bar
                  dataKey="signups"
                  fill="#82ca9d"
                  name="Signups"
                  barSize={isMobile ? 15 : 20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div className="p-3 bg-muted/40 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Views</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.views}
          </div>
        </div>
        <div className="p-3 bg-muted/40 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Signups</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.signups}
          </div>
        </div>
        <div className="p-3 bg-muted/40 rounded-lg">
          <div className="text-sm text-muted-foreground">Conversion Rate</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.averageConversionRate}%
          </div>
        </div>
      </div>
    </Card>
  );
}
