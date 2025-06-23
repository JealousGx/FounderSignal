"use client";

import {
  Bar,
  BarChart,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineDataProps {
  timelineData: {
    dailySignups: {
      date: string;
      signups: number;
    }[];
    weeklySignups: {
      week: string;
      signups: number;
      period: string;
    }[];
  };
}

export default function TimelineData({ timelineData }: TimelineDataProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Timeline Analysis</CardTitle>

        <CardDescription>Performance data over time</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4 bg-gray-200">
            <TabsTrigger value="daily">Daily</TabsTrigger>

            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData.dailySignups}
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
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="value" name="Signups" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData.weeklySignups}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="value" name="Signups" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
