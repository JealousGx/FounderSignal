import {
  BarChart3,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RedditValidation } from "@/types/reddit-validation";

export function OverviewTab({ validation }: { validation: RedditValidation }) {
  return (
    <div className="space-y-4">
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
