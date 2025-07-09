import { Metadata } from "next";

export const siteConfig = {
  name: "FounderSignal",
  title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
  description:
    "A real-time micro-validation platform for startup founders to test startup ideas within 72 hours — powered by dynamic MVPs, user feedback, and AI summaries.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://foundersignal.app",
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL}/assets/og-image.png`,
};

export const createMetadata = (pageMetadata: {
  title: string;
  description: string;
  image?: string;
  urlPath?: string;
}): Metadata => {
  const { title, description, image, urlPath } = pageMetadata;
  const ogImageUrl = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${urlPath ? `/${urlPath}` : ""}`;

  return {
    title,
    description,
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
