"use client";

import {
  BarChart3,
  ExternalLink,
  Lightbulb,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DetailedReportProps {
  validation: RedditValidation;
}

export function DetailedReport({ validation }: DetailedReportProps) {
  const [activeTab, setActiveTab] = useState("overview");

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
        <TabsList className="grid w-full grid-cols-6 bg-gray-200">
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

function OverviewTab({ validation }: { validation: RedditValidation }) {
  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {validation.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {validation.insightDensity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Posts Analyzed</span>
              </div>
              <div className="text-2xl font-bold">
                {validation.insightDensity.totalPosts}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Sentiment Score</span>
              </div>
              <div className="text-2xl font-bold">
                {(validation.insightDensity.sentimentScore * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Engagement Rate</span>
              </div>
              <div className="text-2xl font-bold">
                {(validation.insightDensity.engagementRate * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Reddit Threads */}
      {validation.topRedditThreads &&
        validation.topRedditThreads.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Top Reddit Threads</CardTitle>
              <CardDescription>
                Most relevant and highly-engaged discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validation.topRedditThreads.slice(0, 5).map((thread) => (
                  <div
                    key={thread.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          r/{thread.subreddit}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {thread.score} points • {thread.comments} comments
                        </span>
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {thread.title}
                      </h4>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function MarketTab({ validation }: { validation: RedditValidation }) {
  if (!validation.marketAssessment) return null;

  const market = validation.marketAssessment;

  return (
    <div className="space-y-4">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Market Size</h4>
              <p className="text-sm text-gray-600">{market.marketSize}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Growth Potential</h4>
              <p className="text-sm text-gray-600">{market.growthPotential}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Competition Level</h4>
            <p className="text-sm text-gray-600">{market.competition}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Barriers to Entry</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {market.barriers.map((barrier, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {barrier}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Market Opportunities</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {market.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightsTab({ validation }: { validation: RedditValidation }) {
  if (!validation.keyPatterns || !validation.insightDensity) return null;

  const patterns = validation.keyPatterns;
  const density = validation.insightDensity;

  return (
    <div className="space-y-4">
      {/* Theme Breakdown */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Discussion Themes</CardTitle>
          <CardDescription>Breakdown of conversation topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(density.themeBreakdown).map(([theme, count]) => (
              <div key={theme} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{theme}</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(count / density.totalPosts) * 100}
                    className="w-24 h-2"
                  />
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Pain Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.painPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-red-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Desired Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.desiredFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-green-500 mt-1">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>User Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.userBehavior.map((behavior, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  {behavior}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Emerging Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.trends.map((trend, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-purple-500 mt-1">•</span>
                  {trend}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VoiceOfCustomerTab({ validation }: { validation: RedditValidation }) {
  if (!validation.voiceOfCustomer) return null;

  const voice = validation.voiceOfCustomer;

  return (
    <div className="space-y-4">
      {/* Sentiment Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {voice.sentiment}
            </div>
            <p className="text-sm text-gray-600">
              Overall sentiment from Reddit discussions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Quotes */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Voice of Customer</CardTitle>
          <CardDescription>Direct quotes from Reddit users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {voice.quotes.slice(0, 10).map((quote, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <blockquote className="text-sm text-gray-700 italic mb-2">
                  &quot;{quote.text}&quot;
                </blockquote>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    — u/{quote.author} in{" "}
                    <Link
                      href={quote.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      r/{quote.subreddit}
                    </Link>
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{quote.score} points</span>
                    <Badge variant="outline" className="text-xs">
                      {(quote.sentiment * 100).toFixed(0)}% positive
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Themes */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Common Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {voice.commonThemes.map((theme, index) => (
              <Badge key={index} variant="secondary">
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitionTab({ validation }: { validation: RedditValidation }) {
  if (!validation.competitiveLandscape) return null;

  const competition = validation.competitiveLandscape;

  return (
    <div className="space-y-4">
      {/* Existing Tools */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Competitive Landscape</CardTitle>
          <CardDescription>Analysis of existing solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competition.existingTools.map((tool, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{tool.name}</h4>
                  <Badge
                    variant={tool.sentiment > 0.6 ? "default" : "secondary"}
                  >
                    {(tool.sentiment * 100).toFixed(0)}% sentiment
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-2">
                      Strengths
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tool.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-2">
                      Weaknesses
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tool.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Market Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competition.gaps.map((gap, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-orange-500 mt-1">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competition.opportunities.map((opportunity, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-green-500 mt-1">•</span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OpportunitiesTab({ validation }: { validation: RedditValidation }) {
  if (!validation.startupOpportunities || !validation.emergingTrends)
    return null;

  const opportunities = validation.startupOpportunities;
  const trends = validation.emergingTrends;

  return (
    <div className="space-y-4">
      {/* Startup Opportunities */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Startup Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.opportunities.map((opportunity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{opportunity.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {(opportunity.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {opportunity.effort} effort
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {opportunity.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positioning Strategies */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Positioning Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {opportunities.positioning.map((strategy, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 flex items-start gap-2"
              >
                <span className="text-blue-500 mt-1">•</span>
                {strategy}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Emerging Trends */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Emerging Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.trends.map((trend, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{trend.name}</h4>
                  <p className="text-sm text-gray-600">{trend.description}</p>
                </div>
                <Badge variant="outline">
                  {(trend.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Market Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trends.predictions.map((prediction, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 flex items-start gap-2"
              >
                <span className="text-purple-500 mt-1">•</span>
                {prediction}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
