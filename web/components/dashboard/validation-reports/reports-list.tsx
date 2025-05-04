"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, Search, Download, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Report } from "@/types/report";

interface ReportsListProps {
  reports: Report[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.ideaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>All Validation Reports</CardTitle>
            <CardDescription>
              View and analyze your validation data
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-8 w-full md:w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Newest first</DropdownMenuItem>
                <DropdownMenuItem>Oldest first</DropdownMenuItem>
                <DropdownMenuItem>Highest conversion</DropdownMenuItem>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
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
                <TableHead>Report</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchQuery
                      ? "No reports match your search"
                      : "No reports available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {report.ideaTitle}
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
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/reports/${report.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View Report</span>
                          </Link>
                        </Button>
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
    </Card>
  );
}

function ReportTypeBadge({
  type,
}: {
  type: "Weekly" | "Monthly" | "Milestone" | "Final";
}) {
  const colors = {
    Weekly: "bg-blue-100 text-blue-800",
    Monthly: "bg-purple-100 text-purple-800",
    Milestone: "bg-green-100 text-green-800",
    Final: "bg-amber-100 text-amber-800",
  };

  return (
    <Badge
      variant="outline"
      className={colors[type] || "bg-gray-100 text-gray-800"}
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
