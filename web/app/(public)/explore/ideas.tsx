"use client";

import { PaginationWithPageSize } from "@/components/ui/pagination";
import { Idea } from "@/types/idea";
import { ArrowRight, Clock, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getIdeas } from "./get-ideas";

interface IdeasGridClientProps {
  initialIdeas: Idea[];
  initialTotalCount: number;
  defaultItemsPerPage: number;
}

export default function Ideas({
  initialIdeas,
  initialTotalCount,
  defaultItemsPerPage,
}: IdeasGridClientProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(initialTotalCount);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);
  const [totalPages, setTotalPages] = useState<number>(
    Math.ceil(initialTotalCount / defaultItemsPerPage)
  );

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const fetchIdeas = async (page: number, pageSize: number) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const result = await getIdeas({ limit: pageSize, offset });

      if (result && "ideas" in result && Array.isArray(result.ideas)) {
        setIdeas(result.ideas);
        if ("totalCount" in result) {
          setTotalItems(result.totalCount);
        }
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchIdeas(page, itemsPerPage);
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchIdeas(1, newPageSize);
  };

  useEffect(() => {
    setIdeas(initialIdeas ?? []);
    setTotalItems(initialTotalCount ?? 0);
  }, [initialIdeas, initialTotalCount]);

  return (
    <>
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
                  {typeof idea.engagementRate === "number"
                    ? idea.engagementRate.toFixed(2)
                    : "N/A"}
                  %
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {idea.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>
                      {idea.targetAudience?.split(" ")[0] || "General"}
                    </span>
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

      <PaginationWithPageSize
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        pageSizeOptions={[6, 12, 24, 48]}
      />

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
