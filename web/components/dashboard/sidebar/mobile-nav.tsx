"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavItems } from "./navi-items";

export default function MobileDashboardNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center">
        <span className="text-xl font-bold text-primary">FounderSignal</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/submit"
          className="text-sm font-medium text-white bg-primary py-2 px-3 rounded-md inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-700">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[80%] sm:w-[350px] pt-12">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="px-2 py-2">
                <Link
                  href="/submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-3 rounded-md font-medium"
                  onClick={() => setOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  <span>New Idea</span>
                </Link>
              </div>

              <nav className="space-y-1 px-2 py-3 flex-1">
                {NavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm rounded-md group transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setOpen(false)}
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

              <div className="px-2 py-4 mt-auto border-t border-gray-200">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-5 h-5 text-gray-500" />
                  Close menu
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
