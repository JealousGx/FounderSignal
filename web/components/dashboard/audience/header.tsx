import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";

interface PageHeaderProps {
  totalSubscribers: number;
}

export default function PageHeader({ totalSubscribers }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Audience
        </h1>
        <p className="text-muted-foreground">
          {totalSubscribers.toLocaleString()} subscribers across your landing
          pages
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="bg-white">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
