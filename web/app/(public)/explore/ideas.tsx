"use client";

import { ArrowRight, Clock, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PaginationWithPageSize } from "@/components/ui/pagination";
import { getIdeas } from "./get-ideas";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Idea } from "@/types/idea";

const sortOptions = [
  {
    label: "Newest First",
    value: "newest",
  },
  {
    label: "Oldest First",
    value: "oldest",
  },
  {
    label: "Most Signups",
    value: "signups",
  },
  {
    label: "Most Views",
    value: "views",
  },
];

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

  const [selectedSort, setSelectedSort] = useState(sortOptions[0].value);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const fetchIdeas = useCallback(
    async (
      page: number,
      pageSize: number,
      sortBy?: string,
      searchQuery?: string
    ) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const result = await getIdeas({
          limit: pageSize,
          offset,
          sortBy,
          search: searchQuery,
        });

        if (result && "ideas" in result && Array.isArray(result.ideas)) {
          setIdeas(result.ideas);
          if ("totalCount" in result) {
            setTotalItems(result.totalCount);
          }
        } else {
          console.warn("Unexpected result format:", result);
          setIdeas([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching ideas:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchIdeas(page, itemsPerPage, selectedSort, debouncedSearchQuery);
  };

  const handlePageSizeChange = async (value: string) => {
    const newPageSize = parseInt(value, 10);
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    await fetchIdeas(1, newPageSize, selectedSort, debouncedSearchQuery);
  };

  const handleSortChange = async (value: string) => {
    setSelectedSort(value);
    setCurrentPage(1); // Reset to first page when sort changes
    await fetchIdeas(1, itemsPerPage, value, debouncedSearchQuery);
  };

  useEffect(() => {
    setIdeas(initialIdeas ?? []);
    setTotalItems(initialTotalCount ?? 0);
  }, [initialIdeas, initialTotalCount]);

  useEffect(() => {
    // Fetch ideas whenever the debounced search query changes
    handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 justify-end mb-7">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Search for startup ideas by keyword, industry, or problem..."
            className="pl-8 w-full sm:w-[200px] md:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select onValueChange={handleSortChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent align="end" className="w-[200px]">
            <SelectGroup>
              <SelectLabel>Sort By</SelectLabel>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {ideas.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center flex-col text-center py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            No Ideas Found
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mt-4">
            There are no startup ideas available at the moment. Please check
            back later.
          </p>
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
