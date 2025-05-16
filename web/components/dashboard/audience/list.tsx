"use client";

import { ChevronDown, Mail, Search, Tag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
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
  itemsPerPage?: number;
}

export default function AudienceList({
  members: initialMembers,
  total,
  itemsPerPage = 10,
}: AudienceListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(total);

  const filteredMembers = members.filter(
    (member) =>
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.idea?.title &&
        member.idea?.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(totalMembers / itemsPerPage);

  const fetchAudience = async ({
    page,
    pageSize,
    sortBy,
    filterBy,
  }: {
    page: number;
    pageSize: number;
    sortBy?: string;
    filterBy?: string;
  }) => {
    if (isLoading) return;

    // filterBy = filterBy === filters[0].value ? undefined : filterBy; // no need to pass filter if "All Ideas" is selected)

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const result = await getAudience(false, {
        limit: pageSize,
        offset,
        sortBy,
        filterBy,
      });

      if (!result) {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAudience({
      page,
      pageSize: itemsPerPage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>
              People who signed up for your ideas
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email..."
                className="pl-8 w-full md:w-[240px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Filter by idea
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All ideas</DropdownMenuItem>
                <DropdownMenuItem>EcoTrack</DropdownMenuItem>
                <DropdownMenuItem>RemoteTeamOS</DropdownMenuItem>
                <DropdownMenuItem>SkillSwap</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              ) : filteredMembers.length === 0 ? (
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
                filteredMembers.map((member) => (
                  <TableRow key={member.userId + member.ideaId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {member.email}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </CardFooter>
    </Card>
  );
}
