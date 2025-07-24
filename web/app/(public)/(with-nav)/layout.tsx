import React from "react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { AnnouncementHeader } from "@/components/navbar/announcement";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <Navbar />

      {process.env.FF_ENABLE_DISCOUNT_ANNOUNCEMENT === "true" && (
        <AnnouncementHeader />
      )}

      {children}

      <Footer />
    </React.Fragment>
  );
}
