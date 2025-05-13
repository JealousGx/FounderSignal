import { BarChart, CheckCircle, TrendingUp, Users } from "lucide-react";

export type Metrics = {
  totalSignups: number;
  signupsChange: number;
  avgConversion: number;
  conversionChange: number;
  ideasValidated: number;
  ideasChange: number;
  averageSignupsPerIdea: number;
};

export default async function MetricsOverview({
  metrics,
}: {
  metrics: Metrics;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Signups"
        value={metrics.totalSignups.toLocaleString()}
        change={metrics.signupsChange}
        icon={<Users className="h-5 w-5 md:h-6 md:w-6" />}
        color="blue"
      />

      <MetricCard
        title="Avg. Conversion"
        value={`${metrics.avgConversion.toFixed(2)}%`}
        change={metrics.conversionChange}
        icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6" />}
        color="green"
      />

      <MetricCard
        title="Ideas Validated"
        value={metrics.ideasValidated.toLocaleString()}
        change={metrics.ideasChange}
        icon={<CheckCircle className="h-5 w-5 md:h-6 md:w-6" />}
        color="purple"
      />

      <MetricCard
        title="Avg. Signups / Idea"
        value={metrics.averageSignupsPerIdea.toFixed(1)}
        change={0} // Change calculation for this metric can be complex, so 0 for now
        icon={<BarChart className="h-5 w-5 md:h-6 md:w-6" />}
        color="amber"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "amber";
}

function MetricCard({
  title,
  value,
  change = 0.0,
  icon,
  color,
}: MetricCardProps) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-600">
            {title}
          </p>

          <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">{value}</p>

          {change !== 0 && (
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${
                  change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}%
              </span>

              <span className="w-max text-xs text-gray-500 ml-1 hidden md:inline">
                vs last period
              </span>
            </div>
          )}
        </div>

        <div
          className={`rounded-full p-1.5 md:p-2 ${bgColors[color]} ${textColors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
