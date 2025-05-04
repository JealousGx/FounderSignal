export function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "paused":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStageBadgeColor(stage: string) {
  switch (stage.toLowerCase()) {
    case "validation":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "mvp":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "ideation":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
