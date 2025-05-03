"use client";

import * as React from "react";
import { NavbarLogo } from "./navbar-logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { AuthButtons } from "../auth-buttons";
import { useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="px-2 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
        <NavbarLogo />

        <div className="hidden md:flex">
          <DesktopNav />
        </div>

        <div className="hidden md:flex gap-4">
          <AuthButtons isSignedIn={isSignedIn} />
        </div>

        <div className="md:hidden">
          <MobileNav isSignedIn={isSignedIn} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
