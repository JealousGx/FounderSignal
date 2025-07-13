import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  FlaskConical,
  Lightbulb,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getRedditValidationSample } from "./get-sample";

export const revalidate = 31536000; // 1 year

export const metadata: Metadata = createMetadata({
  title: "Reddit Market Validation Sample - AI Startup Insights & Trends",
  description:
    "See real Reddit-driven market validation for startup ideas. Explore actionable insights, trends, and customer pain points—powered by AI. Validate your own idea with FounderSignal and build what the market truly wants.",
  urlPath: "samples/reddit-validation",
});

export default async function PublicRedditValidationSample() {
  const v = await getRedditValidationSample();

  if (!v) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center bg-gray-50 rounded-lg shadow-md">
        <svg
          className="w-16 h-16 text-red-500 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Reddit Sample Not Found
        </h2>

        <p className="text-gray-600 mb-6 max-w-md">
          Unfortunately, we couldn&apos; load the specific Reddit market
          validation sample at this moment. This might be due to a temporary
          issue or it&apos;s not currently available.
        </p>

        <div className="space-y-4">
          <p className="text-gray-700 font-medium">However, you can still:</p>

          <ul className="list-disc list-inside text-left text-gray-600 space-y-2">
            <li>
              <a
                href="mailto:support@foundersignal.app"
                className="text-blue-600 hover:underline"
              >
                Contact our team
              </a>{" "}
              if you&apos;re looking for custom market research or a specific
              sample.
            </li>

            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Return to the homepage
              </Link>{" "}
              to discover other valuable resources.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-0">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <Badge
          variant="secondary"
          className="mb-4 text-base px-4 py-2 rounded-full"
        >
          <TrendingUp className="inline-block mr-2 h-5 w-5" />
          Reddit Validation Sample
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
          See Real Reddit Market Insights in Action
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover how FounderSignal analyzes thousands of Reddit conversations
          to validate your startup idea—before you build. This is a real sample
          of the actionable insights you’ll get.
        </p>
        <Link href="/submit" passHref>
          <Button size="lg" className="text-lg px-8 py-4 shadow-lg">
            Start Your Own Validation &rarr;
          </Button>
        </Link>
      </section>
      {/* Executive Summary */}
      <Card className="mb-8 bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground text-lg leading-relaxed">
            {v.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
          label="Posts Analyzed"
          value={(v.insightDensity?.totalPosts || 0).toLocaleString()}
          color="text-blue-600"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          label="Relevant Posts"
          value={(v.insightDensity?.relevantPosts || 0).toLocaleString()}
          color="text-green-600"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-yellow-500" />}
          label="Sentiment"
          value={`${((v.insightDensity?.sentimentScore || 0) * 100).toFixed(0)}%`}
          color="text-yellow-500"
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          label="Engagement"
          value={`${((v.insightDensity?.engagementRate || 0) * 100).toFixed(0)}%`}
          color="text-purple-600"
        />
      </div>

      {/* Validation Score */}
      <Card className="mb-10 bg-card border-border shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Validation Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-green-700">
              {v.validationScore.toFixed(1)}%
            </span>
            <Progress value={v.validationScore} className="h-3 flex-1" />
          </div>
          <p className="text-muted-foreground mt-2">
            This score reflects overall market demand, sentiment, and engagement
            for your idea based on Reddit analysis.
          </p>
        </CardContent>
      </Card>

      {/* Market Assessment */}
      {v.marketAssessment && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Market Assessment
            </CardTitle>
            <CardDescription>
              A deep dive into the market landscape for your idea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="market-size">
                <AccordionTrigger className="text-lg font-medium">
                  Market Size & Growth Potential
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-2">
                    <strong>Market Size:</strong>{" "}
                    {v.marketAssessment.marketSize}
                  </p>
                  <p>
                    <strong>Growth Potential:</strong>{" "}
                    {v.marketAssessment.growthPotential}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="competition">
                <AccordionTrigger className="text-lg font-medium">
                  Competition & Barriers
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-2">
                    <strong>Competition:</strong>{" "}
                    {v.marketAssessment.competition}
                  </p>
                  <h4 className="font-semibold mt-4 mb-2">Key Barriers:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {v.marketAssessment.barriers.map((barrier, i) => (
                      <li key={i}>{barrier}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="opportunities">
                <AccordionTrigger className="text-lg font-medium">
                  Market Opportunities
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <h4 className="font-semibold mb-2">
                    Opportunities Identified:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {v.marketAssessment.opportunities.map((opportunity, i) => (
                      <li key={i}>{opportunity}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Theme Breakdown */}
      <Card className="mb-10 bg-card border-border shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Discussion Themes
          </CardTitle>
          <CardDescription>What Redditors are talking about.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(v.insightDensity?.themeBreakdown || {}).map(
              ([theme, count]) => (
                <div
                  key={theme}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/20"
                >
                  <span className="capitalize font-medium text-secondary-foreground">
                    {theme.replace(/-/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        (count / (v.insightDensity?.totalPosts || 1)) * 100
                      }
                      className="w-24 h-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subreddit Analysis */}
      {v.subredditAnalysis && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Subreddit Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown of relevant subreddits and their engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subreddit</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Avg Sentiment</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Relevance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {v.subredditAnalysis.subreddits.map((sub) => (
                    <TableRow key={sub.name}>
                      <TableCell className="font-medium">
                        r/{sub.name}
                      </TableCell>
                      <TableCell>{sub.postCount}</TableCell>
                      <TableCell>
                        {(sub.avgSentiment * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {(sub.engagementRate * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {(sub.relevanceScore * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {v.keyPatterns?.painPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-red-600">
                  <span className="mt-1">•</span>
                  <span className="text-card-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Desired Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {v.keyPatterns?.desiredFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-green-600">
                  <span className="mt-1">•</span>
                  <span className="text-card-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              User Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {v.keyPatterns?.userBehavior.map((behavior, i) => (
                <li key={i} className="flex items-start gap-2 text-blue-600">
                  <span className="mt-1">•</span>
                  <span className="text-card-foreground">{behavior}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              General Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {v.keyPatterns?.trends.map((trend, i) => (
                <li key={i} className="flex items-start gap-2 text-purple-600">
                  <span className="mt-1">•</span>
                  <span className="text-card-foreground">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Voice of Customer */}
      {v.voiceOfCustomer && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Voice of Customer
            </CardTitle>
            <CardDescription>
              Direct quotes and common themes from Reddit users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-card-foreground">
              Key Quotes:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {v.voiceOfCustomer.quotes.map((quote, i) => (
                <Card key={i} className="p-4 bg-secondary/10 border-border">
                  <p className="italic text-muted-foreground mb-2">
                    &quot;{quote.text}&quot;
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      - {quote.author} in r/{quote.subreddit}
                    </span>
                    <Button variant="link" size="sm" asChild>
                      <a
                        href={quote.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Post
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-card-foreground">
              Common Themes:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-card-foreground">
              {v.voiceOfCustomer.commonThemes.map((theme, i) => (
                <li key={i}>{theme}</li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground">
              <strong>Overall Sentiment:</strong> {v.voiceOfCustomer.sentiment}
            </p>
          </CardContent>
        </Card>
      )}
      {/* Competitive Landscape */}
      {v.competitiveLandscape && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-700" />
              Competitive Landscape
            </CardTitle>
            <CardDescription>
              Analysis of existing tools and market gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="existing-tools">
                <AccordionTrigger className="text-lg font-medium">
                  Existing Tools
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {v.competitiveLandscape.existingTools.map((tool, i) => (
                      <Card
                        key={i}
                        className="p-4 bg-secondary/10 border-border"
                      >
                        <h4 className="font-semibold text-primary mb-1">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sentiment: {(tool.sentiment * 100).toFixed(1)}%
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-green-600">
                              Strengths:
                            </p>
                            <ul className="list-disc pl-5">
                              {tool.strengths.map((s, idx) => (
                                <li key={idx} className="text-muted-foreground">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600">
                              Weaknesses:
                            </p>
                            <ul className="list-disc pl-5">
                              {tool.weaknesses.map((w, idx) => (
                                <li key={idx} className="text-muted-foreground">
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gaps-opportunities">
                <AccordionTrigger className="text-lg font-medium">
                  Gaps & Opportunities
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <h4 className="font-semibold mt-4 mb-2">Identified Gaps:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {v.competitiveLandscape.gaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mt-4 mb-2">
                    Strategic Opportunities:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {v.competitiveLandscape.opportunities.map((opp, i) => (
                      <li key={i}>{opp}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
      {/* Emerging Trends */}
      {v.emergingTrends && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-600" />
              Emerging Trends
            </CardTitle>
            <CardDescription>
              Key trends shaping the future of the market.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {v.emergingTrends.trends.map((trend, i) => (
                <div
                  key={i}
                  className="p-3 border border-border rounded-lg bg-accent/10"
                >
                  <h4 className="font-semibold text-primary mb-1 flex justify-between items-center">
                    {trend.name}
                    <Badge variant="outline" className="text-sm font-normal">
                      Confidence: {(trend.confidence * 100).toFixed(0)}%
                    </Badge>
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {trend.description}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-card-foreground">
              Future Predictions:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-card-foreground">
              {v.emergingTrends.predictions.map((prediction, i) => (
                <li key={i}>{prediction}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {/* Startup Opportunities */}
      {v.startupOpportunities && (
        <Card className="mb-10 bg-card border-border shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-orange-500" />
              Startup Opportunities
            </CardTitle>
            <CardDescription>
              Actionable opportunities identified from the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {v.startupOpportunities.opportunities.map((opportunity, i) => (
                <Card key={i} className="p-4 bg-secondary/10 border-border">
                  <h4 className="font-bold text-primary mb-1">
                    {opportunity.title}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">
                      Confidence: {(opportunity.confidence * 100).toFixed(0)}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Effort: {opportunity.effort}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-card-foreground">
              Recommended Positioning:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-card-foreground">
              {v.startupOpportunities.positioning.map((pos, i) => (
                <li key={i}>{pos}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {/* Top Reddit Threads */}
      <Card className="mb-12 bg-card border-border shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Top Reddit Threads
          </CardTitle>
          <CardDescription>
            Most relevant and highly-engaged discussions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {v.topRedditThreads?.map((thread) => (
              <div
                key={thread.id}
                className="flex items-start justify-between p-3 border border-border rounded-lg bg-accent/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      r/{thread.subreddit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {thread.score} points • {thread.comments} comments
                    </span>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2 text-card-foreground">
                    {thread.title}
                  </h4>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={thread.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <section className="text-center py-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-inner mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">
          Ready to Validate Your Own Idea?
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
          Get actionable, AI-powered market insights from Reddit—just like this
          sample. No guesswork, no code, no risk.
        </p>
        <Link href="/submit" passHref>
          <Button size="lg" className="text-lg px-8 py-4 shadow-lg">
            Try FounderSignal Free &rarr;
          </Button>
        </Link>
        <div className="mt-4 text-sm text-muted-foreground">
          No credit card required. Cancel anytime.
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center bg-card rounded-lg shadow p-4 border border-border">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
