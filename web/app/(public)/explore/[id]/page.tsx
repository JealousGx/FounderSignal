import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Calendar,
  Eye,
  TrendingUp,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";
import { formatDate } from "@/lib/utils";
import { CommentsSection } from "./comments-section";
import { Button } from "@/components/ui/button";

async function getIdeaById(id: string) {
  // const res = await fetch(`http://localhost:8080/api/ideas/${id}`);
  // const data = await res.json();

  // Mock data based on the ID
  const mockIdeas = {
    "idea-1": {
      id: "idea-1",
      title: "EcoTrack",
      description:
        "An app that helps consumers track their carbon footprint across daily activities and purchases with personalized recommendations for reducing environmental impact. The platform would integrate with common shopping apps and transportation services to automatically calculate emissions.",
      targetAudience: "Environmentally conscious consumers aged 25-45",
      createdAt: "2023-09-15T14:32:00Z",
      engagementRate: 72,
      views: 458,
      likes: 124,
      dislikes: 5,
      likedByUser: false,
      dislikedByUser: false,
      commentsCount: 24,
      founder: {
        name: "Alex Rivera",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      stats: {
        signups: 183,
        conversionRate: 40,
        avgTimeOnPage: "2m 47s",
        bounceRate: "28%",
      },
      feedbackHighlights: [
        "Love the idea of automatic carbon tracking",
        "Would pay for premium features like detailed reports",
        "Interested in community challenges and comparisons",
      ],
    },
    "idea-2": {
      id: "idea-2",
      title: "SkillSwap",
      description:
        "Peer-to-peer platform where professionals can exchange skills and knowledge without monetary transactions. The marketplace uses a credit system where teaching others earns you credits to learn new skills yourself.",
      targetAudience: "Professionals looking to expand their skill set",
      createdAt: "2023-10-03T09:15:00Z",
      engagementRate: 64,
      views: 312,
      likes: 89,
      dislikes: 3,
      likedByUser: true,
      dislikedByUser: false,
      commentsCount: 12,
      founder: {
        name: "Maya Johnson",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      stats: {
        signups: 127,
        conversionRate: 31,
        avgTimeOnPage: "3m 12s",
        bounceRate: "33%",
      },
      feedbackHighlights: [
        "Credit system makes a lot of sense",
        "Would like geographic filtering for in-person skill exchanges",
        "Need verification system for expertise levels",
      ],
    },
    // Add other ideas here
  };

  return mockIdeas[id as keyof typeof mockIdeas] || null;
}

export default async function IdeaPage({ params }: { params: { id: string } }) {
  const { id: ideaId } = await params;
  const idea = await getIdeaById(ideaId);

  // Mock related ideas data
  const relatedIdeas = [
    {
      id: "idea-3",
      title: "NutriScan",
      description:
        "Mobile app that scans food items and provides personalized nutritional advice",
      engagementRate: 81,
      thumbnail: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: "idea-4",
      title: "RemoteTeamOS",
      description:
        "All-in-one platform for remote teams with project management tools",
      engagementRate: 68,
      thumbnail: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: "idea-5",
      title: "ElderTech",
      description:
        "Simplified technology solutions designed specifically for seniors",
      engagementRate: 59,
      thumbnail: "https://randomuser.me/api/portraits/women/22.jpg",
    },
  ];

  if (!idea) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
      <Link
        href="/explore"
        className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all ideas
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main column - Idea details */}
        <div className="lg:w-2/3">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary">
                  Validated Idea
                </div>

                <div className="bg-green-50 text-green-700 text-sm font-medium rounded-full px-3 py-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  {idea.engagementRate}% Engagement
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {idea.title}
                </h1>

                <CustomLink
                  href={`/mvp/${idea.id}`}
                  target="_blank"
                  variant="outline"
                  className="bg-transparent border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Live MVP
                </CustomLink>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>Created {formatDate(idea.createdAt)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Eye className="w-4 h-4 mr-1.5" />
                  <span>{idea.views} views</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{idea.targetAudience}</span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={idea.founder.image}
                    alt={idea.founder.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">Submitted by</p>
                  <p className="text-gray-900">{idea.founder.name}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {idea.description}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">Validation Results</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Sign-ups</p>
                  <p className="text-2xl font-bold">{idea.stats.signups}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Conversion</p>
                  <p className="text-2xl font-bold">
                    {idea.stats.conversionRate}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Avg. Time</p>
                  <p className="text-2xl font-bold">
                    {idea.stats.avgTimeOnPage}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold">{idea.stats.bounceRate}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3">Feedback Highlights</h3>
              <div className="space-y-2 mb-6">
                {idea.feedbackHighlights.map((feedback, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="text-green-500 w-5 h-5 mr-2 mt-0.5" />
                    <p className="text-gray-700">{feedback}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Is this idea helpful?</h3>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost">
                      <ThumbsUp
                        className={`w-5 h-5 ${
                          idea.likedByUser ? "text-primary" : "text-gray-500"
                        }`}
                      />
                      <span>{idea.likes}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="inline-flex items-center gap-2"
                    >
                      <ThumbsDown
                        className={`w-5 h-5 ${
                          idea.dislikedByUser ? "text-red-500" : "text-gray-500"
                        }`}
                      />
                      <span>{idea.dislikes}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CommentsSection ideaId={idea.id} />

          {/* CTA for visitors */}
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="font-bold text-xl mb-2">Have a similar idea?</h3>
            <p className="text-gray-700 mb-4">
              Validate your own version and see how the market responds.
            </p>

            <CustomLink href={`/submit`}>Create similar idea</CustomLink>
          </div>
        </div>

        {/* Sidebar column - Related ideas */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Related Ideas</h2>
              <p className="text-gray-600 text-sm mt-1">
                Similar concepts that might interest you
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {relatedIdeas.map((relatedIdea) => (
                <Link
                  key={relatedIdea.id}
                  href={`/explore/${relatedIdea.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={relatedIdea.thumbnail}
                        alt={relatedIdea.title}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{relatedIdea.title}</h3>
                        <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                          {relatedIdea.engagementRate}%
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedIdea.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-4 bg-gray-50 text-center">
              <Link
                href="/explore"
                className="text-sm text-primary font-medium hover:underline"
              >
                View all ideas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
