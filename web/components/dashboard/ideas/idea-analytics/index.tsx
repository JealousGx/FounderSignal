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

interface Idea {
  id: string;
  title: string;
  signups: number[];
  views: number[];
  dates: string[];
}

export default function IdeaAnalytics({ ideas }: { ideas: Idea[] }) {
  const [selectedIdea, setSelectedIdea] = useState(ideas[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const currentIdea =
    ideas.find((idea) => idea.id === selectedIdea) || ideas[0];

  const chartData = currentIdea.dates.map((date, index) => ({
    date,
    signups: currentIdea.signups[index],
    views: currentIdea.views[index],
  }));

  const formatTickForMobile = (value: string) => {
    if (isMobile && chartData.length > 5) {
      return value.length > 3 ? value.substring(0, 3) : value;
    }
    return value;
  };

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
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTickForMobile}
                />

                <YAxis tick={{ fontSize: 12 }} width={30} />

                <Tooltip />

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
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTickForMobile}
                />

                <YAxis tick={{ fontSize: 12 }} width={30} />

                <Tooltip />

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
    </Card>
  );
}
