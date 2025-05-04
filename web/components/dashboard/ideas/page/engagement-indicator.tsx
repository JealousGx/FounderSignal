import { ArrowUp, ArrowDown } from "lucide-react";

interface EngagementIndicatorProps {
  rate: number;
  className?: string;
}

export function EngagementIndicator({
  rate,
  className = "",
}: EngagementIndicatorProps) {
  if (rate > 60) {
    return <ArrowUp className={`h-3 w-3 text-green-600 ${className}`} />;
  } else if (rate < 40) {
    return <ArrowDown className={`h-3 w-3 text-red-600 ${className}`} />;
  }
  return null;
}
