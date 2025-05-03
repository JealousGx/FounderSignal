import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

async function getIdeas() {
  // const res = await fetch('http://localhost:8080/api/ideas');
  // const data = await res.json();

  // Mock data for now
  return [
    {
      id: "idea-1",
      title: "EcoTrack",
      description:
        "An app that helps consumers track their carbon footprint across daily activities and purchases with personalized recommendations.",
      targetAudience: "Environmentally conscious consumers aged 25-45",
      createdAt: "2023-09-15T14:32:00Z",
      engagementRate: 72,
      views: 458,
    },
    {
      id: "idea-2",
      title: "SkillSwap",
      description:
        "Peer-to-peer platform where professionals can exchange skills and knowledge without monetary transactions.",
      targetAudience: "Professionals looking to expand their skill set",
      createdAt: "2023-10-03T09:15:00Z",
      engagementRate: 64,
      views: 312,
    },
    {
      id: "idea-3",
      title: "NutriScan",
      description:
        "Mobile app that scans food items and provides personalized nutritional advice based on user's dietary goals and restrictions.",
      targetAudience:
        "Health-conscious individuals and those with dietary restrictions",
      createdAt: "2023-10-18T11:45:00Z",
      engagementRate: 81,
      views: 594,
    },
    {
      id: "idea-4",
      title: "RemoteTeamOS",
      description:
        "All-in-one platform for remote teams that combines project management, async communication, and team culture building.",
      targetAudience: "Startups and companies with distributed teams",
      createdAt: "2023-09-28T16:20:00Z",
      engagementRate: 68,
      views: 427,
    },
    {
      id: "idea-5",
      title: "ElderTech",
      description:
        "Simplified technology solutions designed specifically for seniors, including hardware and software with accessibility features.",
      targetAudience: "Adults 65+ and their caregivers",
      createdAt: "2023-10-10T13:10:00Z",
      engagementRate: 59,
      views: 286,
    },
  ];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ExplorePage() {
  const ideas = await getIdeas();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore Startup Ideas
          </h1>
          <div className="hidden md:block">
            <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-primary">
                Updated in real-time
              </span>
            </div>
          </div>
        </div>

        <p className="text-xl text-gray-600 max-w-3xl">
          Browse through validated startup ideas from our community of founders.
          Get inspired or analyze market validation results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ideas.map((idea) => (
          <Link
            key={idea.id}
            href={`/explore/${idea.id}`}
            className="group flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {idea.title}
                </h2>
                <div className="bg-green-50 text-green-700 text-sm font-medium rounded-full px-2.5 py-0.5 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {idea.engagementRate}%
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {idea.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{idea.targetAudience.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDate(idea.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {idea.views} views
              </span>
              <span className="text-sm font-medium text-primary flex items-center group-hover:underline">
                View details <ArrowRight className="ml-1 w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="px-6 py-3 bg-white cursor-pointer">
          Load More Ideas
        </Button>
      </div>
    </div>
  );
}
