"use client";

import { Grid, Search, Table } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import IdeasGridView from "./grid-view";
import IdeasTableView from "./table-view";

import { getUserIdeas } from "@/app/dashboard/ideas/get-ideas";
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
import { Idea } from "@/types/idea";

interface IdeasDataViewProps {
  initialIdeas: Idea[];
  totalIdeas: number;
}

const TABLE_ITEMS_PER_PAGE = 10;
const GRID_ITEMS_PER_PAGE = 6;

const filters = [
  {
    label: "All Ideas",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Paused",
    value: "paused",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Draft",
    value: "draft",
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
    label: "Most Signups",
    value: "signups",
  },
  {
    label: "Most Views",
    value: "views",
  },
];

export default function IdeasDataView({
  initialIdeas,
  totalIdeas: _totalIdeas,
}: IdeasDataViewProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(TABLE_ITEMS_PER_PAGE);
  const [totalIdeas, setTotalIdeas] = useState(_totalIdeas);
  const [selectedFilter, setSelectedFilter] = useState(filters[0].value);
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

  const totalPages = Math.ceil(totalIdeas / itemsPerPage);

  const fetchIdeas = async ({
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

    filterBy = filterBy === filters[0].value ? undefined : filterBy; // no need to pass filter if "All Ideas" is selected)

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const result = await getUserIdeas(false, {
        limit: pageSize,
        offset,
        sortBy,
        filterBy,
        search,
      });

      if (!result) {
        setIdeas([]);
        setTotalIdeas(0);
      }

      if (result && "ideas" in result && Array.isArray(result.ideas)) {
        setIdeas(result.ideas);
      }
      if ("total" in result) {
        setTotalIdeas(result.total);
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchIdeas({
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
    await fetchIdeas({
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
    await fetchIdeas({
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
    await fetchIdeas({
      page: 1,
      pageSize: itemsPerPage,
      filterBy: selectedFilter,
      sortBy: value,
      search: debouncedSearchQuery,
    });
  };

  useEffect(() => {
    // Fetch ideas whenever the debounced search query changes
    handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>All Ideas</CardTitle>

            <CardDescription>
              View and manage your validation projects
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Search for ideas by keyword, industry, or problem..."
                className="pl-8 w-full sm:w-[200px] md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filters" />
              </SelectTrigger>
              <SelectContent align="end" className="w-[200px]">
                <SelectGroup>
                  <SelectLabel>Filter by Status</SelectLabel>
                  {filters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

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
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          defaultValue="table"
          className="w-full"
          onValueChange={(val) =>
            val === "table"
              ? setItemsPerPage(TABLE_ITEMS_PER_PAGE)
              : setItemsPerPage(GRID_ITEMS_PER_PAGE)
          }
        >
          <TabsList className="mb-4">
            <TabsTrigger
              value="table"
              title="Table View"
              aria-label="Table View"
            >
              <Table className="h-4 w-4" />
            </TabsTrigger>

            <TabsTrigger value="grid" title="Grid View" aria-label="Grid View">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="w-full">
            <IdeasTableView ideas={ideas} />
          </TabsContent>

          <TabsContent value="grid">
            <IdeasGridView ideas={ideas} />
          </TabsContent>
        </Tabs>
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
