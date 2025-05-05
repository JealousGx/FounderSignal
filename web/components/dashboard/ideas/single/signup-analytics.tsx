"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Idea } from "@/types/idea";

interface SignupAnalyticsProps {
  idea: Idea;
}

// Simplify the SignupAnalytics component
export default function SignupAnalytics({ idea }: SignupAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup Overview</CardTitle>
        <CardDescription>Track your validation progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span>Total Signups:</span>
            <span className="font-bold text-lg">{idea.signups}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Conversion Rate:</span>
            <span className="font-bold text-lg">
              {((idea.signups / Math.max(idea.views, 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={(idea.signups / idea.targetSignups) * 100}
            className="h-2 mt-2"
          />
          <p className="text-xs text-muted-foreground text-center">
            {idea.signups}/{idea.targetSignups} signups goal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
