import { UserRound, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function PageHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <UserRound className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and app settings
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          <span>Account Security</span>
        </Button>
        <div className="relative ml-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
