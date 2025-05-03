"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavbarLogo } from "./navbar-logo";
import { AuthButtons } from "../auth-buttons";

interface MobileNavProps {
  isSignedIn?: boolean;
}

export function MobileNav({ isSignedIn }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="px-6">
        <SheetHeader className="px-0">
          <SheetTitle>
            <NavbarLogo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-4">
          <Link
            href="/explore"
            className={cn(
              "py-2 text-lg font-medium transition-colors",
              pathname === "/explore"
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Explore Ideas
          </Link>
          <Link
            href="/submit"
            className={cn(
              "py-2 text-lg font-medium transition-colors",
              pathname === "/submit"
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Submit Idea
          </Link>
          <div className="h-[1px] bg-border mb-6" />
          <AuthButtons isSignedIn={isSignedIn} variant="vertical" />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
