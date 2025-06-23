import { Card, CardContent } from "@/components/ui/card";
import { AudienceStats } from "@/types/audience";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface AudienceOverviewProps {
  stats: AudienceStats;
}

export default function AudienceOverview({ stats }: AudienceOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Subscribers"
        value={stats.totalSubscribers}
        valueFormatted={stats.totalSubscribers.toLocaleString()}
      />

      <MetricCard
        label="New Subscribers (30 days)"
        value={stats.newSubscribers}
        valueFormatted={stats.newSubscribers.toLocaleString()}
        change={stats.newSubscribersChange}
      />

      <MetricCard
        label="Average Conversion Rate"
        value={stats.averageConversionRate}
        valueFormatted={`${stats.averageConversionRate.toFixed(2)}%`}
        change={stats.conversionRateChange}
      />

      <MetricCard
        label="Active Ideas"
        value={stats.activeIdeas}
        valueFormatted={stats.activeIdeas.toLocaleString()}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  valueFormatted: string;
  change?: number;
}

function MetricCard({ label, valueFormatted, change }: MetricCardProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">{label}</p>

        <div className="flex items-baseline mt-1 gap-2">
          <h3 className="text-2xl font-bold">{valueFormatted}</h3>

          {change !== undefined && Math.abs(change) > 0 && (
            <div
              className={`flex items-center text-xs font-medium ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              )}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
