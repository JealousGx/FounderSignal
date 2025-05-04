"use client";

interface CircularProgressIndicatorProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color?: string;
}

export function CircularProgressIndicator({
  percentage,
  size = 100,
  strokeWidth = 10,
  color = "#3b82f6",
}: CircularProgressIndicatorProps) {
  // Calculate the radius
  const radius = (size - strokeWidth) / 2;
  // Calculate the circumference of the circle
  const circumference = radius * 2 * Math.PI;
  // Calculate the dash offset based on the percentage
  const dashOffset = circumference - (percentage / 100) * circumference;

  // Calculate center position
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{
          transition: "stroke-dashoffset 0.5s ease-in-out",
        }}
      />

      {/* Center text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 4}
        fontWeight="bold"
        fill="#1e293b"
      >
        {percentage}%
      </text>
    </svg>
  );
}
