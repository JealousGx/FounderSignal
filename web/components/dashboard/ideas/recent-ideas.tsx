import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, BarChart2, Eye } from "lucide-react";

import { Link } from "@/components/ui/link";
import { Idea } from "@/types/idea";

export default async function RecentIdeas({
  recentIdeas,
}: {
  recentIdeas: Idea[];
}) {
  if (!recentIdeas || recentIdeas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold">Recent Ideas</h2>
        <p className="text-sm text-gray-600">No recent ideas found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-4">
        <div>
          <h2 className="text-lg font-bold">Recent Ideas</h2>

          <p className="text-xs md:text-sm text-gray-600">
            Your latest validation projects
          </p>
        </div>

        <Link
          className="text-primary hover:text-primary/90 text-sm p-0 h-auto hover:bg-transparent"
          variant="ghost"
          href="/dashboard/ideas"
          passHref
        >
          View all
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-y border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">
                Idea
              </th>

              <th scope="col" className="px-6 py-3">
                Status
              </th>

              <th scope="col" className="px-6 py-3">
                Signups
              </th>

              <th scope="col" className="px-6 py-3">
                Created
              </th>

              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {recentIdeas.map((idea) => (
              <tr key={idea.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{idea.title}</div>

                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {idea.description}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${getStatusStyles(idea.status)}`}
                  >
                    {idea.status}
                  </span>
                </td>

                <td className="px-6 py-4 font-medium">
                  {idea.signups.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {formatDistanceToNow(new Date(idea.createdAt), {
                    addSuffix: true,
                  })}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/mvp/${idea.id}`}
                      passHref
                      size="sm"
                      variant="ghost"
                      title="View MVP"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/dashboard/ideas/${idea.id}`}
                      passHref
                      size="sm"
                      variant="ghost"
                      title="View analytics"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {recentIdeas.map((idea) => (
            <div key={idea.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{idea.title}</div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full capitalize
                  ${getStatusStyles(idea.status)}`}
                >
                  {idea.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {idea.description}
              </p>

              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3">
                  <span className="text-gray-700 font-medium">
                    {idea.signups.toLocaleString()} signups
                  </span>

                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(idea.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Link
                    href={`/mvp/${idea.id}`}
                    passHref
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title="View MVP"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href={`/dashboard/ideas/${idea.id}`}
                    passHref
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title="View analytics"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-50 text-green-700";
    case "completed":
      return "bg-blue-50 text-blue-700";
    case "paused":
      return "bg-amber-50 text-amber-700";
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "archived":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}
