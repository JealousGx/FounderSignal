import { CheckIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircularProgressIndicator } from "@/components/ui/circular-progress-indicator";

import { Report } from "@/types/report";

interface ValidationStatusProps {
  report: Report;
  thresholds: {
    signups: number;
    conversionRate: number;
  };
}

export default function ValidationStatus({
  report,
  thresholds,
}: ValidationStatusProps) {
  const signupsPercentage = (report.signups / thresholds.signups) * 100;
  const conversionPercentage =
    (report.conversionRate / thresholds.conversionRate) * 100;

  const isValidated = report.validated;

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Validation Status</CardTitle>

            <CardDescription>
              Progress against key validation metrics
            </CardDescription>
          </div>

          {isValidated ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Validated
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-800 border-gray-200"
            >
              Not Validated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="pt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <CircularProgressIndicator
              percentage={signupsPercentage}
              size={100}
              strokeWidth={8}
              color={signupsPercentage >= 100 ? "#22c55e" : "#3b82f6"}
            />

            <div className="mt-2 text-center">
              <p className="text-sm font-medium">Signups</p>

              <p className="text-xs text-muted-foreground">
                {report.signups.toLocaleString()} /{" "}
                {thresholds.signups.toLocaleString()} target
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgressIndicator
              percentage={conversionPercentage}
              size={100}
              strokeWidth={8}
              color={conversionPercentage >= 100 ? "#22c55e" : "#3b82f6"}
            />

            <div className="mt-2 text-center">
              <p className="text-sm font-medium">Conversion</p>

              <p className="text-xs text-muted-foreground">
                {report.conversionRate.toFixed(2)}% /{" "}
                {thresholds.conversionRate.toFixed(2)}% target
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <ValidationItem
            text="Minimum signup threshold"
            isValidated={report.signups >= thresholds.signups}
          />

          <ValidationItem
            text="Minimum conversion rate"
            isValidated={report.conversionRate >= thresholds.conversionRate}
          />

          <ValidationItem
            text="Data collection complete for this report"
            isValidated={report.signups >= thresholds.signups}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ValidationItemProps {
  text: string;
  isValidated: boolean;
}

function ValidationItem({ text, isValidated }: ValidationItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`rounded-full p-1 ${
          isValidated
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {isValidated ? (
          <CheckIcon className="h-3 w-3" />
        ) : (
          <XIcon className="h-3 w-3" />
        )}
      </div>

      <span className="text-sm">{text}</span>
    </div>
  );
}
