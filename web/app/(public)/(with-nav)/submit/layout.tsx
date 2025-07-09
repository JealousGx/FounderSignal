import { Metadata, ResolvingMetadata } from "next";
import React from "react";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Submit Your Startup Idea for Validation",
    description:
      "Got a startup idea? Submit it to FounderSignal and get it validated by real users within 72 hours. Start your validation journey for free.",
    openGraph: {
      title: "Submit Your Startup Idea for Validation",
      description: "Get your startup idea validated within 72 hours.",
      images: previousImages,
    },
    twitter: {
      title: "Submit Your Startup Idea for Validation",
      description: "Get your startup idea validated within 72 hours.",
      images: previousImages,
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <React.Fragment>{children}</React.Fragment>;
}
