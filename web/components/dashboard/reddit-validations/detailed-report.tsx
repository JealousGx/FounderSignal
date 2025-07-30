"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RedditValidation } from "@/types/reddit-validation";

import { CompetitionTab } from "./report-competition-tab";
import { VoiceOfCustomerTab } from "./report-customers-voice-tab";
import { InsightsTab } from "./report-insights-tab";
import { MarketTab } from "./report-market-tab";
import { OpportunitiesTab } from "./report-opportunities-tab";
import { OverviewTab } from "./report-overview-tab";

interface DetailedReportProps {
  validation: RedditValidation;
}

export function DetailedReport({ validation }: DetailedReportProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!validation || !validation.id) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No validation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validation.status !== "completed") {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Report not available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Reddit Validation Report
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of Reddit conversations
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {validation.validationScore?.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Validation Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={validation.validationScore || 0} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto bg-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="voice">Voice of Customer</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab validation={validation} />
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <MarketTab validation={validation} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsTab validation={validation} />
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <VoiceOfCustomerTab validation={validation} />
        </TabsContent>

        <TabsContent value="competition" className="space-y-4">
          <CompetitionTab validation={validation} />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <OpportunitiesTab validation={validation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
