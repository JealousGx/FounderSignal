import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Minus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

interface IdeasStatCardsProps {
  total: number;
  stats: {
    activeIdeas: number;
    totalSignups: number;
    totalViews: number;
    activeIdeasChange: number;
    totalIdeasChange: number;
    signupsChange: number;
    viewsChange: number;
  };
}

export default function IdeasStatCards({ total, stats }: IdeasStatCardsProps) {
  const {
    activeIdeas,
    totalSignups,
    totalViews,
    activeIdeasChange = 0,
    totalIdeasChange = 0,
    signupsChange = 0,
    viewsChange = 0,
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Ideas"
        value={total}
        icon={<Sparkles className="h-4 w-4 md:h-5 md:w-5" />}
        trend={totalIdeasChange}
        color="purple"
      />
      <StatCard
        label="Active Ideas"
        value={activeIdeas}
        icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
        trend={activeIdeasChange}
        color="blue"
        subtitle={`${Math.round((activeIdeas / total) * 100)}% of total`}
      />
      <StatCard
        label="Total Signups"
        value={totalSignups}
        icon={<Users className="h-4 w-4 md:h-5 md:w-5" />}
        trend={signupsChange}
        color="green"
        subtitle="Across all ideas"
      />
      <StatCard
        label="Total Views"
        value={totalViews}
        icon={<Eye className="h-4 w-4 md:h-5 md:w-5" />}
        trend={viewsChange}
        color="amber"
        subtitle={`${Math.round(
          (totalSignups / totalViews) * 100
        )}% conversion`}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  color?: "blue" | "green" | "purple" | "amber";
  subtitle?: string;
}

function StatCard({
  label,
  value,
  icon,
  trend = 0,
  color = "blue",
  subtitle,
}: StatCardProps) {
  const bgColors = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    amber: "bg-amber-50",
  };

  const textColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  };

  // need to define the border color for the top border
  // due to tailwindcss JIT compilation
  const topBorderBgColors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    amber: "bg-amber-600",
  };

  const hasChange = trend !== 0;

  return (
    <Card className="bg-white overflow-hidden relative p-0">
      <div className={`h-1 w-full ${topBorderBgColors[color]}`}></div>

      <CardContent className="p-2 md:p-4 flex flex-col justify-between flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              {hasChange && <TrendIndicator value={trend} />}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mt-1">
              {value.toLocaleString()}
            </h3>

            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {icon && (
            <div
              className={`rounded-full p-1.5 md:p-2 ${bgColors[color]} ${textColors[color]}`}
            >
              {icon}
            </div>
          )}
        </div>

        {hasChange && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
            <span
              className={`text-xs ${
                trend > 0
                  ? "text-green-600"
                  : trend < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return <ArrowUp className="h-3 w-3 text-green-600" />;
  } else if (value < 0) {
    return <ArrowDown className="h-3 w-3 text-red-600" />;
  }

  return <Minus className="h-3 w-3 text-gray-400" />;
}
