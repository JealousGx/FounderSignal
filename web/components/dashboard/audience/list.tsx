"use client";

import { Mail, Search, Tag } from "lucide-react";
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

import { getAudience } from "@/app/dashboard/audience/get-audience";
import { formatDate } from "@/lib/utils";
import { AudienceMember } from "@/types/audience";
import Link from "next/link";

interface AudienceListProps {
  members: AudienceMember[];
  total: number;
}

const sortOptions = [
  {
    label: "Newest First",
    value: "newest",
  },
  {
    label: "Oldest First",
    value: "oldest",
  },
];

export default function AudienceList({
  members: initialMembers,
  total,
}: AudienceListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(total);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const totalPages = Math.ceil(totalMembers / itemsPerPage);

  const fetchAudience = async ({
    page,
    pageSize,
    sortBy,
    search,
  }: {
    page: number;
    pageSize: number;
    sortBy?: string;
    search?: string;
  }) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const result = await getAudience(false, {
        limit: pageSize,
        offset,
        sortBy,
        search,
      });

      if (!result || !Array.isArray(result.audiences)) {
        setMembers([]);
        setTotalMembers(0);
      }

      if (result && "audiences" in result && Array.isArray(result.audiences)) {
        setMembers(result.audiences);
      }
      if ("total" in result) {
        setTotalMembers(result.total);
      }

      if (typeof result?.total !== "number") {
        // If API response for total is not a number, set totalMembers to 0 to avoid NaN issues in pagination.
        setTotalMembers(0);
      }
    } catch (error) {
      console.error("Error fetching audience:", error);
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchAudience({
      page,
      pageSize: itemsPerPage,
      sortBy: selectedSort,
      search: debouncedSearchQuery,
    });
  };

  const handlePageSizeChange = async (value: string) => {
    const newPageSize = parseInt(value, 10);

    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    await fetchAudience({
      page: 1,
      pageSize: newPageSize,
      sortBy: selectedSort,
      search: debouncedSearchQuery,
    });
  };

  const handleSortChange = async (value: string) => {
    setSelectedSort(value);
    setCurrentPage(1); // Reset to first page when sort changes
    await fetchAudience({
      page: 1,
      pageSize: itemsPerPage,
      sortBy: value,
      search: debouncedSearchQuery,
    });
  };

  useEffect(() => {
    setMembers(initialMembers);
    setTotalMembers(total);
  }, [initialMembers, total]);

  useEffect(() => {
    // Fetch audience whenever the debounced search query changes
    handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>
              People who signed up for your ideas
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Search audience by idea title"
                className="pl-8 w-full sm:w-[200px] md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
                <TableHead>Email</TableHead>
                <TableHead>Signed Up For</TableHead>
                <TableHead>Date</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground h-[370px]"
                  >
                    Loading subscribers...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground h-[370px]"
                  >
                    {searchQuery
                      ? "No subscribers match your search"
                      : "No subscribers available"}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.userId + member.ideaId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {member.email || "Anonymous"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/ideas/${member.ideaId}`}
                        className="flex items-center"
                      >
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        {member.idea?.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(member.signupTime)}</TableCell>
                    {/* <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Send email</DropdownMenuItem>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell> */}
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
