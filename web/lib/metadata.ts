import { Metadata } from "next";

export const siteConfig = {
  name: "FounderSignal",
  title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
  description:
    "A real-time micro-validation platform for startup founders to test startup ideas within 72 hours — powered by dynamic MVPs, user feedback, and AI summaries.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://foundersignal.app",
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL}/assets/og-image.png`,
  keywords: [
    "validate startup",
    "validate your idea",
    "startup validation",
    "idea validation",
    "validate startup idea",
    "market validation",
    "founder tools",
    "MVP builder",
    "user feedback",
    "FounderSignal",
  ],
};

export const createMetadata = (pageMetadata: {
  title: string;
  description: string;
  image?: string;
  urlPath?: string;
  keywords?: string[];
}): Metadata => {
  const { title, description, image, urlPath, keywords = [] } = pageMetadata;
  const ogImageUrl = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${urlPath ? `/${urlPath}` : ""}`;

  const combinedKeywords = [...new Set([...siteConfig.keywords, ...keywords])];

  return {
    title,
    description,
    keywords: combinedKeywords,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
};
