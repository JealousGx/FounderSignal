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
