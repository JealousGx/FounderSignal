import { Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RedditValidation } from "@/types/reddit-validation";

export function MarketTab({ validation }: { validation: RedditValidation }) {
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
