import { ArrowRight, Lightbulb } from "lucide-react";
import { Suspense } from "react";

import PageHeader from "@/components/dashboard/validation-reports/header";
import InsightsSection from "@/components/dashboard/validation-reports/insights-section";
import PerformanceOverview from "@/components/dashboard/validation-reports/performance-overview";
import ReportsList from "@/components/dashboard/validation-reports/reports-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Report } from "@/types/report";
import { getReports } from "./get-reports";

const REPORTS_PER_PAGE = 10;

type ReportExtended = Report & {
  recommendations: string[];
};

export default async function ValidationReportsPage() {
  const data = await getReports(true, { limit: REPORTS_PER_PAGE });

  return (
    <div className="space-y-6">
      <PageHeader reportsCount={data.total} />

      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <PerformanceOverview
          overview={data.overview}
          totalReports={data.total}
        />
      </Suspense>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ReportsList
              reports={data.reports}
              itemsPerPage={REPORTS_PER_PAGE}
              totalReports={data.total}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <InsightsSection
              recentInsights={data.recentInsights}
              successData={data.successData}
              conversionData={data.conversionData}
              totalReports={data.total}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RecommendationsSection reports={data.reports} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationsSection({ reports }: { reports: ReportExtended[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.slice(0, 4).map((report) => (
        <RecommendationCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function RecommendationCard({ report }: { report: ReportExtended }) {
  const recommendations = report.recommendations;

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              Recommendation for {report.idea?.title}
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
        <ul className="space-y-2 list-decimal pl-5">
          {recommendations.map((rec, index) => (
            <li key={index} className="text-sm">
              {rec}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Link
          href={`/dashboard/ideas/${report.ideaId}`}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          View Idea
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
