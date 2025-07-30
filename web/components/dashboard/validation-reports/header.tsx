import { FileText } from "lucide-react";
import GenerateReports from "../reports/generate";

interface PageHeaderProps {
  reportsCount: number;
}

export default function PageHeader({ reportsCount }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Validation Reports
        </h1>

        <p className="text-muted-foreground">
          {reportsCount} report(s) across your validation projects
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <GenerateReports />
        {/* <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button> */}
      </div>
    </div>
  );
}
