import { Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RedditValidation } from "@/types/reddit-validation";

export function OpportunitiesTab({
  validation,
}: {
  validation: RedditValidation;
}) {
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 flex-wrap">
                  <h4 className="font-medium break-words max-w-[90vw]">
                    {opportunity.title}
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="break-words max-w-[90vw]"
                    >
                      {(opportunity.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="capitalize break-words max-w-[90vw]"
                    >
                      {opportunity.effort} effort
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 break-words max-w-[90vw]">
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
                className="text-sm text-gray-700 flex items-start gap-2 break-words"
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
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium break-words max-w-[90vw]">
                    {trend.name}
                  </h4>
                  <p className="text-sm text-gray-600 break-words max-w-[90vw]">
                    {trend.description}
                  </p>
                </div>
                <Badge variant="outline" className="break-words max-w-[90vw]">
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
                className="text-sm text-gray-700 flex items-start gap-2 break-words max-w-[90vw]"
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
