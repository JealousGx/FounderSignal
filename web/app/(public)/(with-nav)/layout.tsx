import React from "react";

import Navbar from "@/components/navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <Navbar />

      {children}

      <footer className="w-full bg-secondary-foreground py-2 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} FounderSignal. All rights
            reserved.
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}
