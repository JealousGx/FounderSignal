import { formatDistanceToNow } from "date-fns";
import { User, ThumbsUp, MessageSquare, LineChart } from "lucide-react";

export default async function ActivityFeed({ userId }: { userId: string }) {
  const activities = await getUserActivities(userId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-max">
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <p className="text-xs md:text-sm text-gray-600">
          Latest events from your MVPs
        </p>
      </div>

      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <ul className="space-y-3 md:space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-2 md:gap-3">
              <div
                className={`h-fit rounded-full p-1.5 md:p-2 flex-shrink-0 ${getActivityIconStyles(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div>
                <p className="text-xs md:text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case "signup":
      return <User className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "feedback":
      return <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "engagement":
      return <ThumbsUp className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "analytics":
      return <LineChart className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    default:
      return <User className="h-3.5 w-3.5 md:h-4 md:w-4" />;
  }
}

function getActivityIconStyles(type: string) {
  switch (type) {
    case "signup":
      return "bg-blue-50 text-blue-600";
    case "feedback":
      return "bg-purple-50 text-purple-600";
    case "engagement":
      return "bg-green-50 text-green-600";
    case "analytics":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
}

// Mock function - replace with actual implementation
async function getUserActivities(userId: string) {
  // In a real app, fetch from API or database
  return [
    {
      id: "act-1",
      type: "signup",
      description: "New signup for EcoTrack from example@gmail.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
      id: "act-2",
      type: "feedback",
      description:
        'Someone left feedback on RemoteTeamOS: "Love the concept, would use this daily!"',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "act-3",
      type: "engagement",
      description: "12 new likes on SkillSwap in the last hour",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: "act-4",
      type: "analytics",
      description: "EcoTrack reached 100 signups milestone",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: "act-5",
      type: "signup",
      description: "New signup for SkillSwap from user123@example.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
  ];
}
