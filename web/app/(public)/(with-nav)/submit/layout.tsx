import { Metadata } from "next";
import React from "react";

import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Submit Your Startup Idea for Validation",
  description:
    "Got a startup idea? Submit it to FounderSignal and get it validated by real users within 72 hours. Start your validation journey for free.",
  urlPath: "submit",
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <React.Fragment>{children}</React.Fragment>;
}
