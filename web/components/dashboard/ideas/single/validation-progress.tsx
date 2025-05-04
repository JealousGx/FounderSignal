import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getStageBadgeColor } from "../utils";
import { Idea } from "@/types/idea";

interface ValidationProgressProps {
  idea: Idea;
}

export default function ValidationProgress({ idea }: ValidationProgressProps) {
  const validationGoals = {
    Ideation: 20,
    Validation: 100,
    MVP: 500,
  };

  const currentStage = idea.stage || "Ideation";
  const goalSignups = validationGoals[currentStage] || 100;
  const progress = Math.min(
    100,
    Math.round((idea.signups / goalSignups) * 100)
  );

  // Generate milestones
  const milestones = [
    {
      name: "Problem Fit",
      target: validationGoals.Ideation,
      complete: progress >= 20,
    },
    {
      name: "Solution Fit",
      target: validationGoals.Validation,
      complete: progress >= 100,
    },
    {
      name: "Market Fit",
      target: validationGoals.MVP,
      complete: progress >= 500,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Validation Progress</CardTitle>
            <CardDescription>
              Tracking against your validation goals
            </CardDescription>
          </div>
          <Badge className={getStageBadgeColor(currentStage)}>
            {currentStage} Stage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">
              Current goal: {goalSignups} signups
            </span>
            <span className="text-sm font-medium">
              {idea.signups}/{goalSignups}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">
            {progress}% complete for {currentStage} validation
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
