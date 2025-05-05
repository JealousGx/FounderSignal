"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { NavItems } from "./navi-items";

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-screen sticky top-0 flex-col w-64 bg-white border-r border-gray-200 py-4">
      <div className="px-6 py-4 mb-4">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-primary">FounderSignal</span>
        </Link>
      </div>

      <div className="px-3 mb-6">
        <Button className="w-full justify-start gap-2" asChild>
          <Link href="/submit">
            <Plus className="w-5 h-5" />
            <span>New Idea</span>
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {NavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md group transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 mr-3",
                  pathname === item.href
                    ? "text-primary"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-3 mt-auto pt-4 border-t border-gray-200">
        <SignOutButton>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
