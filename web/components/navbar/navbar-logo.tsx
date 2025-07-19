"use client";

import { useTheme } from "next-themes";
import Link from "next/link";

import { OptimizedImage } from "../ui/image";

export function NavbarLogo() {
  const { theme = "light" } = useTheme(); // TODO: Handle theme changes more gracefully

  return (
    <Link href="/" className="flex items-center space-x-2">
      <OptimizedImage
        src={theme === "light" ? "/logo-light.svg" : "/logo-dark.svg"}
        alt="FounderSignal Logo"
        width={50}
        height={50}
        priority
        quality={90}
      />
    </Link>
  );
}
