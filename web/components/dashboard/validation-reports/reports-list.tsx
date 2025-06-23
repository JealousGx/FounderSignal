"use client";

import { Download, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getReports } from "@/app/dashboard/reports/get-reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link as CustomLink } from "@/components/ui/link";
import { PaginationWithPageSize } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn, formatDate } from "@/lib/utils";
import { Report, ReportType } from "@/types/report";

interface ReportsListProps {
  reports: Report[];
  totalReports: number;
}

const filters = [
  {
    label: "All Reports",
    value: "all",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Milestone",
    value: "milestone",
  },
  {
    label: "Final",
    value: "final",
  },
];

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
    label: "Highest Conversion Rate",
    value: "conversionRate",
  },
  {
    label: "Lowest Conversion Rate",
    value: "views",
  },
  {
    label: "Highest Sentiment",
    value: "sentiment",
  },
  {
    label: "Validated",
    value: "validated",
  },
  {
    label: "Name (A-Z)",
    value: "nameAsc",
  },
];

export default function ReportsList({
  reports: initialReports,
  totalReports: _totalReports,
}: ReportsListProps) {
  const [reports, setReports] = useState(initialReports);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(_totalReports);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
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

  const totalPages = Math.ceil(totalReports / itemsPerPage);

  const fetchReports = async ({
    page,
    pageSize,
    sortBy,
    filterBy,
    search,
  }: {
    page: number;
    pageSize: number;
    sortBy?: string;
    filterBy?: string;
    search?: string;
  }) => {
    if (isLoading) return;

    filterBy = filterBy === filters[0].value ? undefined : filterBy; // no need to pass filter if "All Reports" is selected)

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const result = await getReports(false, {
        limit: pageSize,
        offset,
        sortBy,
        filterBy,
        search,
      });

      if (!result || !Array.isArray(result.reports)) {
        setReports([]);
        setTotalReports(0);
      }

      if (result && "reports" in result && Array.isArray(result.reports)) {
        setReports(result.reports);
      }
      if ("total" in result) {
        setTotalReports(result.total);
      }

      if (typeof result.total !== "number") {
        setTotalReports(0);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      setTotalReports(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchReports({
      page,
      pageSize: itemsPerPage,
      filterBy: selectedFilter,
      sortBy: selectedSort,
      search: debouncedSearchQuery,
    });
  };

  const handlePageSizeChange = async (value: string) => {
    const newPageSize = parseInt(value, 10);

    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    await fetchReports({
      page: 1,
      pageSize: newPageSize,
      filterBy: selectedFilter,
      sortBy: selectedSort,
      search: debouncedSearchQuery,
    });
  };

  const handleFilterChange = async (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
    await fetchReports({
      page: 1,
      pageSize: itemsPerPage,
      filterBy: value,
      sortBy: selectedSort,
      search: debouncedSearchQuery,
    });
  };
  const handleSortChange = async (value: string) => {
    setSelectedSort(value);
    setCurrentPage(1); // Reset to first page when sort changes
    await fetchReports({
      page: 1,
      pageSize: itemsPerPage,
      filterBy: selectedFilter,
      sortBy: value,
      search: debouncedSearchQuery,
    });
  };

  useEffect(() => {
    setReports(initialReports);
    setTotalReports(_totalReports);
  }, [initialReports, _totalReports]);

  useEffect(() => {
    // Fetch reports whenever the debounced search query changes
    handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>All Validation Reports</CardTitle>

            <CardDescription>
              View and analyze your validation data
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Search reports by idea title"
                className="pl-8 w-full sm:w-[200px] md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              defaultValue={selectedFilter}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filters" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="w-[200px] bg-white border-gray-200"
              >
                <SelectGroup>
                  <SelectLabel>Filter by Type</SelectLabel>
                  {filters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              defaultValue={selectedSort}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="w-[200px] bg-white border-gray-200"
              >
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>

                <TableHead>Date</TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Conversion</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground h-[490px]"
                  >
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground h-[490px]"
                  >
                    {searchQuery
                      ? "No reports match your search"
                      : "No reports available"}
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {report.idea?.title}
                      </Link>
                    </TableCell>

                    <TableCell>{formatDate(report.date)}</TableCell>

                    <TableCell>
                      <ReportTypeBadge type={report.type} />
                    </TableCell>

                    <TableCell>
                      <ValidatedBadge validated={report.validated} />
                    </TableCell>

                    <TableCell>{report.conversionRate}%</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CustomLink
                          variant="ghost"
                          size="sm"
                          href={`/dashboard/reports/${report.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />

                          <span className="sr-only">View Report</span>
                        </CustomLink>

                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />

                          <span className="sr-only">Download Report</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter>
        <PaginationWithPageSize
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </CardFooter>
    </Card>
  );
}

function ReportTypeBadge({ type }: { type: ReportType }) {
  const colors = {
    weekly: "bg-blue-100 text-blue-800",
    monthly: "bg-purple-100 text-purple-800",
    milestone: "bg-green-100 text-green-800",
    final: "bg-amber-100 text-amber-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn(colors[type] || "bg-gray-100 text-gray-800", "capitalize")}
    >
      {type}
    </Badge>
  );
}

function ValidatedBadge({ validated }: { validated: boolean }) {
  return validated ? (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      Validated
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-500 border-gray-200"
    >
      Not Validated
    </Badge>
  );
}
