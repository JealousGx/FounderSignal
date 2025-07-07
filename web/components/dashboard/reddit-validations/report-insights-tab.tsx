import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { RedditValidation } from "@/types/reddit-validation";

export function InsightsTab({ validation }: { validation: RedditValidation }) {
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
