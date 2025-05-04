import { Search, Filter, Grid, Table } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IdeasTableView from "./table-view";
import IdeasGridView from "./grid-view";
import { Idea } from "@/types/idea";

interface IdeasDataViewProps {
  ideas: Idea[];
}

export default function IdeasDataView({ ideas }: IdeasDataViewProps) {
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
                placeholder="Search ideas..."
                className="pl-8 w-full sm:w-[200px] md:w-[250px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>

                <DropdownMenuItem>All Ideas</DropdownMenuItem>

                <DropdownMenuItem>Active</DropdownMenuItem>

                <DropdownMenuItem>Paused</DropdownMenuItem>

                <DropdownMenuItem>Completed</DropdownMenuItem>

                <DropdownMenuItem>Draft</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Sort By</DropdownMenuLabel>

                <DropdownMenuItem>Newest First</DropdownMenuItem>

                <DropdownMenuItem>Oldest First</DropdownMenuItem>

                <DropdownMenuItem>Most Signups</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="table" className="w-full">
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
    </Card>
  );
}
