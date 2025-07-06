"use client";

import { CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";
import { RedditValidation } from "@/types/reddit-validation";
import { getRedditValidation } from "./actions";

interface RedditValidationCardProps {
  validationId: string;
  ideaTitle: string;
}

export function RedditValidationCard({
  validationId,
  ideaTitle,
}: RedditValidationCardProps) {
  const [validation, setValidation] = useState<RedditValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchValidation = async () => {
      try {
        const data = await getRedditValidation(validationId);
        setValidation(data);
      } catch (error) {
        console.error("Failed to fetch validation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidation();

    // Poll for updates if processing
    if (validation?.status === "processing") {
      const interval = setInterval(fetchValidation, 5000);
      return () => clearInterval(interval);
    }
  }, [validationId, validation?.status]);

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="animate-pulse bg-gray-200 h-4 w-4 rounded" />
            <div className="animate-pulse bg-gray-200 h-6 w-32 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-20 w-full rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!validation) return null;

  const getStatusIcon = () => {
    switch (validation.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (validation.status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Reddit Validation</CardTitle>
          </div>
          <Badge className={cn("uppercase", getStatusColor())}>
            {validation.status}
          </Badge>
        </div>
        <CardDescription>Analysis for: {ideaTitle}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {validation.status === "processing" && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Analyzing Reddit conversations... This may take a few minutes.
            </p>
          </div>
        )}

        {validation.status === "failed" && (
          <div className="text-center py-4">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-600">
              {validation.error || "Failed to generate validation"}
            </p>
          </div>
        )}

        {validation.status === "completed" &&
          validation.validationScore !== undefined && (
            <div className="space-y-6">
              {/* Validation Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {validation.validationScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Validation Score
                </div>
                <Progress value={validation.validationScore} className="h-2" />
              </div>

              {/* Executive Summary */}
              {validation.executiveSummary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {validation.executiveSummary}
                  </p>
                </div>
              )}

              {/* Key Metrics */}
              {validation.insightDensity && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {validation.insightDensity.totalPosts}
                    </div>
                    <div className="text-xs text-gray-600">Posts Analyzed</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {validation.insightDensity.relevantPosts}
                    </div>
                    <div className="text-xs text-gray-600">Relevant Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {(validation.insightDensity.sentimentScore * 100).toFixed(
                        0
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-600">Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {(validation.insightDensity.engagementRate * 100).toFixed(
                        0
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/reddit-validations/${validation.id}`}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Full Report
                </Link>
                {/* <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Audience Insights
                </Button> */}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
