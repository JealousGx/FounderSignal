import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/dashboard/validation-reports/header";
import PerformanceOverview from "@/components/dashboard/validation-reports/performance-overview";
import ReportsList from "@/components/dashboard/validation-reports/reports-list";
import InsightsSection from "@/components/dashboard/validation-reports/insights-section";
import { getUserReports } from "@/lib/api";

export default async function ValidationReportsPage() {
  // In a real app, this would be from auth
  const userId = "user_123";
  const reports = await getUserReports(userId);

  return (
    <div className="space-y-6">
      <PageHeader reportsCount={reports.length} />

      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <PerformanceOverview reports={reports} />
      </Suspense>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ReportsList reports={reports} />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <InsightsSection reports={reports} />
          </Suspense>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RecommendationsSection reports={reports} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Recommendations section is included here for completeness
function RecommendationsSection({ reports }: { reports: Report[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.slice(0, 4).map((report) => (
        <RecommendationCard key={report.id} report={report} />
      ))}
    </div>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Report } from "@/types/report";

function RecommendationCard({ report }: { report: Report }) {
  const recommendations = [
    "Consider adding more social proof to your landing page",
    "Test a simplified signup form to increase conversions",
    "Your price point may be causing hesitation - try A/B testing",
    "The most engaged users came from mobile devices - optimize for mobile",
  ];

  // Select a random recommendation for demo purposes
  const recommendation =
    recommendations[Math.floor(Math.random() * recommendations.length)];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              Recommendation for {report.ideaTitle}
            </CardTitle>
            <CardDescription>
              {new Date(report.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="bg-amber-100 p-2 rounded-full">
            <Lightbulb className="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">{recommendation}</p>
        <Button variant="outline" asChild size="sm" className="mt-2">
          <Link href={`/dashboard/ideas/${report.ideaId}`}>
            View Idea
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
