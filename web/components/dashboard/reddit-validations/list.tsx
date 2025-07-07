"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { PaginationWithPageSize } from "@/components/ui/pagination";
import { RedditValidation } from "@/types/reddit-validation";
import { getRedditValidations } from "./actions";

const ITEMS_PER_PAGE = 10;

export function RedditValidationList({
  validations: initialValidations,
  total: initialTotal,
}: {
  validations: RedditValidation[];
  total: number;
}) {
  const [validations, setValidations] =
    useState<RedditValidation[]>(initialValidations);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
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
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!validations || validations.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reddit validations yet
          </h3>

          <p className="text-gray-600 mb-4">
            Generate your first Reddit validation to get AI-powered market
            insights.
          </p>

          <Link
            href="/dashboard/ideas"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Ideas
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {validations.map((validation) => (
        <Card key={validation.id} className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {validation.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {validation.status === "processing" && (
                  <Clock className="h-5 w-5 text-blue-600" />
                )}
                {validation.status === "failed" && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <CardTitle className="text-lg">
                    Reddit Validation for {validation.ideaTitle}
                  </CardTitle>
                  <CardDescription>
                    {validation.processedAt && (
                      <span>
                        Generated{" "}
                        {formatDistanceToNow(new Date(validation.processedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  validation.status === "completed"
                    ? "default"
                    : validation.status === "processing"
                      ? "secondary"
                      : "destructive"
                }
                className="uppercase"
              >
                {validation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {validation.status === "completed" &&
              validation.validationScore !== undefined && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
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
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {validation.executiveSummary}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/reddit-validations/${validation.id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Full Report
                    </Link>
                  </div>
                </div>
              )}

            {validation.status === "processing" && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Analyzing Reddit conversations... This may take a few minutes.
                </p>
              </div>
            )}

            {validation.status === "failed" && (
              <div className="text-center py-4">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-600">
                  {validation.error || "Failed to generate validation"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <PaginationWithPageSize
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
