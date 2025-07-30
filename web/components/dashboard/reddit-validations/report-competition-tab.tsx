import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RedditValidation } from "@/types/reddit-validation";

export function CompetitionTab({
  validation,
}: {
  validation: RedditValidation;
}) {
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <h4 className="font-medium break-words max-w-[90vw]">
                    {tool.name}
                  </h4>
                  <Badge
                    variant={tool.sentiment > 0.6 ? "default" : "secondary"}
                    className="break-words"
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
                        <li
                          key={idx}
                          className="flex items-start gap-2 break-words max-w-[90vw]"
                        >
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
                        <li
                          key={idx}
                          className="flex items-start gap-2 break-words max-w-[90vw]"
                        >
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
