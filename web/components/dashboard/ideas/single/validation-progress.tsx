import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Idea } from "@/types/idea";
import { getStageBadgeColor } from "../utils";

interface ValidationProgressProps {
  idea: Idea;
}

export default function ValidationProgress({ idea }: ValidationProgressProps) {
  const progress = (idea.signups / idea.targetSignups) * 100;

  const milestonesGoal = {
    ProblemFit: 1,
    SolutionFit: 1.5,
    MarketFit: 3,
    ScaleFit: 5,
  };

  const milestones = [
    {
      name: "Problem Fit",
      target: idea.targetSignups,
      complete: progress >= milestonesGoal.ProblemFit * 100,
    },
    {
      name: "Solution Fit",
      target: idea.targetSignups * milestonesGoal.SolutionFit,
      complete: progress >= milestonesGoal.SolutionFit * 100,
    },
    {
      name: "Market Fit",
      target: idea.targetSignups * milestonesGoal.MarketFit,
      complete: progress >= milestonesGoal.MarketFit * 100,
    },
  ];

  let currentGoal = idea.targetSignups;

  if (progress >= milestonesGoal.ProblemFit * 100) {
    currentGoal = idea.targetSignups * milestonesGoal.SolutionFit;
  }
  if (progress >= milestonesGoal.SolutionFit * 100) {
    currentGoal = idea.targetSignups * milestonesGoal.MarketFit;
  }
  if (progress >= milestonesGoal.MarketFit * 100) {
    currentGoal = idea.targetSignups * milestonesGoal.ScaleFit;
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Validation Progress</CardTitle>
            <CardDescription>
              Tracking against your validation goals
            </CardDescription>
          </div>
          <Badge className={`${getStageBadgeColor(idea.stage)} capitalize`}>
            {idea.stage} Stage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">
              Current goal: {currentGoal} signups
            </span>
            <span className="text-sm font-medium">
              {idea.signups}/{idea.targetSignups}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">
            {progress.toFixed(2)}% complete for {idea.stage} validation
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Validation Milestones</h3>

          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-2 ${
                      milestone.complete ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                  <span>{milestone.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {milestone.target} signups
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
