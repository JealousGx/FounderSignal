import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdeasPageHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Ideas</h1>
        <p className="text-muted-foreground">
          Manage and track all your validation projects
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/submit">
          <Plus className="h-4 w-4" />
          Create New Idea
        </Link>
      </Button>
    </div>
  );
}
