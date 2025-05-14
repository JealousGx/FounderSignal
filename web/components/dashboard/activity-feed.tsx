"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import {
  ArrowDownUp,
  Eye,
  HelpCircle,
  MessageSquare,
  MousePointerClick,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useActivity } from "@/contexts/activity-context";
import { ActivityType } from "@/types/activity";

export default function ActivityFeed() {
  const { activities, isConnected } = useActivity();

  console.log("ActivityFeed.isConnected", isConnected);

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-max">
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <p className="text-xs md:text-sm text-gray-600">
            Latest events from your MVPs
          </p>
        </div>
        <div>
          {isConnected ? (
            <span title="Real-time updates connected">
              <Wifi className="h-5 w-5 text-green-500" />
            </span>
          ) : (
            <span title="Real-time updates disconnected">
              <WifiOff className="h-5 w-5 text-red-500" />
            </span>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 pb-4 md:pb-6">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity.
          </p>
        ) : (
          <ul className="space-y-3 md:space-y-4">
            {activities.map((activity) => (
              <li
                key={activity.id + activity.timestamp}
                className="flex gap-2 md:gap-3 items-start"
              >
                <div
                  className={`h-fit rounded-full p-1.5 md:p-2 flex-shrink-0 mt-0.5 ${getActivityIconStyles(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium">
                    {activity.message}
                  </p>
                  {activity.ideaTitle &&
                    activity.ideaTitle !== "Unknown Idea" && (
                      <Link
                        href={`/dashboard/ideas/${activity.ideaId}`}
                        className="text-xs text-gray-600 hover:underline"
                      >
                        Idea:{" "}
                        <span className="font-semibold">
                          {activity.ideaTitle}
                        </span>
                      </Link>
                    )}
                  <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "cta_click":
      return <MousePointerClick className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "pageview":
      return <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "scroll_depth":
      return <ArrowDownUp className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "time_on_page":
      return <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "comment":
      return <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "like":
      return <ThumbsUp className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    case "dislike":
      return <ThumbsDown className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    default:
      return <HelpCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />;
  }
}

function getActivityIconStyles(type: ActivityType) {
  switch (type) {
    case "cta_click":
      return "bg-blue-50 text-blue-600";
    case "pageview":
      return "bg-purple-50 text-purple-600";
    case "scroll_depth":
      return "bg-green-50 text-green-600";
    case "time_on_page":
      return "bg-teal-50 text-teal-600";
    case "comment":
      return "bg-yellow-50 text-yellow-600";
    case "like":
      return "bg-pink-50 text-pink-600";
    case "dislike":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}
