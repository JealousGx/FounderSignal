"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no previous page, redirect to explore
      router.push("/explore");
    }
  };

  return (
    <React.Fragment>
      {children}

      <Button
        onClick={handleGoBack}
        aria-label="Go back to previous page"
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full p-0 shadow-lg"
        title="Go back to previous page"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
    </React.Fragment>
  );
}
