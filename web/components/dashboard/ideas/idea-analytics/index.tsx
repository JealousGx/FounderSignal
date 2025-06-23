"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnalyticsData = {
  ideaId: string;
  ideaTitle: string;
  dataPoints: {
    date: string;
    views: number;
    signups: number;
    conversionRate: number;
  }[];
  totals: {
    views: number;
    signups: number;
    averageConversionRate: number;
  };
};

export default function IdeaAnalytics({
  analytics,
}: {
  analytics: AnalyticsData[];
}) {
  const [selectedIdea, setSelectedIdea] = useState(
    analytics.length > 0 ? analytics[0].ideaId : ""
  );
  const [isMobile, setIsMobile] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
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

  useEffect(() => {
    if (selectedIdea) {
      const currentIdea = analytics.find(
        (idea) => idea.ideaId === selectedIdea
      );
      if (currentIdea) {
        setAnalyticsData(currentIdea);
      }
    }
  }, [selectedIdea, analytics]);

  const formatTickForMobile = (value: string) => {
    if (isMobile && analyticsData && analyticsData.dataPoints.length > 5) {
      return value.length > 3 ? value.substring(0, 3) : value;
    }
    return value;
  };

  // If no ideas are available, show a message
  if (analytics.length === 0) {
    return (
      <Card className="p-6 bg-white border-gray-200">
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
      <Card className="p-6 bg-white border-gray-200">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium">Loading analytics...</h2>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-white border-gray-200">
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
            <SelectContent className="bg-white border-gray-200">
              {analytics.map((idea) => (
                <SelectItem key={idea.ideaId} value={idea.ideaId}>
                  {idea.ideaTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="line" className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full grid grid-cols-2 bg-gray-200 rounded-lg">
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
                    return [value, name === "Views" ? "Views" : "Signups"];
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
                    return [value, name === "Views" ? "Views" : "Signups"];
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
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Views</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.views.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Signups</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.signups.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="text-xl font-semibold">
            {analyticsData.totals.averageConversionRate.toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
