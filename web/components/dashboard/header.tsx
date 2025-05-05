"use client";

import { UserProfile } from "@clerk/nextjs";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardHeader() {
  return (
    <header className="border-b border-gray-200 bg-white py-3 px-4 md:px-6 flex items-center justify-between">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex max-w-md flex-1 mr-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

          <Input
            type="search"
            placeholder="Search ideas, reports..."
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-700">
          <Bell className="h-5 w-5" />
        </Button>

        <UserProfile />
      </div>
    </header>
  );
}
