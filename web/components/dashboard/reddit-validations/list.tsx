"use client";

import { VariantProps } from "class-variance-authority";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaginationWithPageSize } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

import { RedditValidation } from "@/types/reddit-validation";
import { getRedditValidations } from "./actions";

export function RedditValidationList({
  validations: initialValidations,
  total: initialTotal,
  itemsPerPage: initialItemsPerPage = 6,
}: {
  validations: RedditValidation[];
  total: number;
  itemsPerPage?: number;
}) {
  const [validations, setValidations] =
    useState<RedditValidation[]>(initialValidations);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalIdeas, setTotalIdeas] = useState(initialTotal);

  const totalPages = Math.ceil(totalIdeas / itemsPerPage);

  const fetchValidations = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;

      const result = await getRedditValidations({ limit: pageSize, offset });

      if (!result) {
        setValidations([]);
        setTotalIdeas(0);
        return;
      }

      if (
        result &&
        "validations" in result &&
        Array.isArray(result.validations)
      ) {
        setValidations(result.validations);
      }
      if ("total" in result) {
        setTotalIdeas(result.total);
      }
    } catch (err) {
      console.error("Failed to fetch validations:", err);
      setValidations([]);
      setTotalIdeas(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    await fetchValidations({
      page,
      pageSize: itemsPerPage,
    });
  };

  const handlePageSizeChange = async (value: string) => {
    const newPageSize = parseInt(value, 10);

    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    await fetchValidations({
      page: 1,
      pageSize: newPageSize,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Card key={i} className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex animate-pulse gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="mt-4 h-10 w-full rounded-md bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!validations || validations.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Reddit validations yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Generate your first Reddit validation to get AI-powered market
            insights and see if your idea has potential.
          </p>
          <Link
            href="/dashboard/ideas"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Validate an Idea
          </Link>
        </CardContent>
      </Card>
    );
  }

  const renderCardContent = (validation: RedditValidation) => {
    const statusConfig = {
      completed: {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        badge: "default",
      },
      processing: {
        icon: <Clock className="h-5 w-5 text-blue-600" />,
        badge: "secondary",
      },
      failed: {
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        badge: "destructive",
      },
    };

    const { icon, badge } =
      statusConfig[validation.status] || statusConfig.failed;

    const cardContent = (
      <Card className="bg-white border-gray-200 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold leading-snug">
                  {validation.ideaTitle}
                </CardTitle>
                <CardDescription className="text-sm">
                  {validation.processedAt
                    ? `Generated ${formatDistanceToNow(new Date(validation.processedAt), { addSuffix: true })}`
                    : "Generation date not available"}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={badge as VariantProps<typeof badgeVariants>["variant"]}
              className="uppercase whitespace-nowrap"
            >
              {validation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          {validation.status === "completed" &&
            validation.validationScore !== undefined && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {validation.validationScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Validation Score
                  </div>
                  <Progress
                    value={validation.validationScore}
                    className="h-2"
                  />
                </div>
                {validation.executiveSummary && (
                  <p className="text-sm text-gray-700 line-clamp-3 mt-4">
                    {validation.executiveSummary}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-center text-sm font-medium text-blue-600">
                  View Full Report &rarr;
                </div>
              </div>
            )}

          {validation.status === "processing" && (
            <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <p className="text-sm text-blue-800">
                Analyzing Reddit... This may take a few minutes.
              </p>
            </div>
          )}

          {validation.status === "failed" && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="overflow-auto">
                <strong>Validation Failed:</strong>{" "}
                {validation.error || "An unknown error occurred."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );

    if (validation.status === "completed") {
      return (
        <Link
          key={validation.id}
          href={`/dashboard/reddit-validations/${validation.id}`}
          className="block"
        >
          {cardContent}
        </Link>
      );
    }

    return <div key={validation.id}>{cardContent}</div>;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {validations.map((validation) => renderCardContent(validation))}
      </div>

      <PaginationWithPageSize
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        pageSizeOptions={[6, 12, 24, 48]}
      />
    </div>
  );
}
