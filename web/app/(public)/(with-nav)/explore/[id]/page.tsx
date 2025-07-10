import {
  ArrowLeft,
  Calendar,
  Check,
  Eye,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import { ShareIdeaUrl } from "@/components/dashboard/ideas/single/share";
import { ReactionButtons } from "@/components/reactions-btns";
import { ReportButton } from "@/components/report-btn";
import { OptimizedImage } from "@/components/ui/image";
import { Link as CustomLink } from "@/components/ui/link";
import { CommentsSection } from "./comments-section";
import { IdeaActions } from "./idea-actions";

import { api } from "@/lib/api";
import { getClerkUser } from "@/lib/auth";
import { createMetadata } from "@/lib/metadata";
import { formatDate, getName } from "@/lib/utils";
import { Idea } from "@/types/idea";

export const revalidate = 3600;

type IdeaExtended = Idea & {
  founder: {
    name: string;
    image: string;
  };
  stats: {
    signups: number;
    conversionRate: number;
    avgTimeOnPage: string;
    bounceRate: number;
  };
  feedbackHighlights: string[];
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: ideaId } = await params;
  const data = await getIdea(ideaId);

  if (!data?.idea) {
    return {
      title: "Idea Not Found",
    };
  }

  const idea = data.idea;
  const title = `${idea.title}`;
  const description =
    `Validation data for the startup idea: ${idea.title}. See signups, conversion rates, and user feedback. ` +
    (idea.description
      ? idea.description.substring(0, 100) + "..."
      : "Discover if this idea has potential.");

  return createMetadata({
    title,
    description,
    image: idea.imageUrl,
    urlPath: `explore/${idea.id}`,
  });
}

const getIdea = cache(async (id: string) => {
  try {
    const response = await api.get(`/ideas/${id}`, {
      next: {
        revalidate: 3600,
        tags: [`idea-${id}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching more idea:",
        response.status,
        response.statusText
      );

      return null;
    }

    const jsonRes = await response.json();

    return {
      idea: jsonRes.idea as IdeaExtended,
      relatedIdeas: jsonRes.relatedIdeas as Partial<Idea>[],
    };
  } catch (error) {
    console.error("Error in getIdea:", error);
    return null;
  }
});

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ideaId } = await params;
  const res = await getIdea(ideaId);

  if (!res || !res.idea) {
    notFound();
  }

  const idea = res.idea;
  const relatedIdeas = res.relatedIdeas;

  const founder = await getClerkUser(idea.userId);

  idea.founder = {
    name: getName(founder),
    image: founder.imageUrl,
  };

  const stages = {
    validation: "Validated Idea",
    ideation: "Ideation Stage",
    mvp: "MVP Stage",
  };

  const ideaStage =
    stages[idea.stage as keyof typeof stages] || idea.stage || "Unknown Stage";

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
        <div className={relatedIdeas.length === 0 ? "lg:w-full" : "lg:w-2/3"}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary">
                  {ideaStage}
                </div>

                <div className="bg-green-50 text-green-700 text-sm font-medium rounded-full px-3 py-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  {idea.engagementRate}% Engagement
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <OptimizedImage
                      src={idea.imageUrl || "/assets/images/placeholder.webp"}
                      alt={idea.title}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {idea.title}
                  </h1>
                </div>

                <IdeaActions ideaId={idea.id} ideaUserId={idea.userId} />
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>Created {formatDate(idea.createdAt)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Eye className="w-4 h-4 mr-1.5" />
                  <span>
                    {idea.views} view{idea.views > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{idea.targetAudience}</span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <OptimizedImage
                    src={idea.founder.image}
                    alt={idea.founder.name}
                    width={40}
                    height={40}
                    quality={70}
                    objectFit="contain"
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
                  <p className="text-gray-600 text-sm mb-1">
                    Sign-up{idea.stats.signups > 1 ? "s" : ""}
                  </p>
                  <p className="text-2xl font-bold">{idea.stats.signups}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Conversion</p>
                  <p className="text-2xl font-bold">
                    {idea.stats.conversionRate.toFixed(2)}%
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
                  <p className="text-2xl font-bold">
                    {idea.stats.bounceRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              {idea.feedbackHighlights?.length > 0 && (
                <>
                  <h3 className="text-lg font-bold mb-3">
                    Feedback Highlights
                  </h3>
                  <div className="space-y-2 mb-6">
                    {idea.feedbackHighlights.map((feedback, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="text-green-500 w-5 h-5 mr-2 mt-0.5" />
                        <p className="text-gray-700">{feedback}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Is this idea helpful?</h3>

                  <div className="flex items-center gap-1">
                    <ReactionButtons
                      ideaId={ideaId}
                      likedByUser={idea.likedByUser}
                      dislikedByUser={idea.dislikedByUser}
                      likes={idea.likes}
                      dislikes={idea.dislikes}
                    />

                    <ShareIdeaUrl ideaId={ideaId} variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </ShareIdeaUrl>

                    <ReportButton ideaId={ideaId} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="p-4 md:p-6 w-full text-center">
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              </div>
            }
          >
            <CommentsSection ideaId={idea.id} ideaCreatorId={idea.userId} />
          </Suspense>

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
        {relatedIdeas.length > 0 && (
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
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {relatedIdea.imageUrl ? (
                          <OptimizedImage
                            src={relatedIdea.imageUrl}
                            alt={relatedIdea.title!}
                            width={48}
                            height={48}
                            objectFit="contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        )}
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
        )}
      </div>
    </div>
  );
}
