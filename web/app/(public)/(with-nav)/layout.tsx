import React from "react";

import { Footer } from "@/components/footer";
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

      <Footer />
    </React.Fragment>
  );
}
