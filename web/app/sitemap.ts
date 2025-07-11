import { MetadataRoute } from "next";

import { siteConfig } from "@/lib/metadata";
import { Idea } from "@/types/idea";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ideasResponse = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/ideas?limit=1000&offset=0",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  const ideas: Idea[] = ideasResponse?.ideas ?? [];

  const ideaUrls = ideas.map((idea) => ({
    url: `${siteConfig.url}/explore/${idea.id}`,
    lastModified: new Date(idea.updatedAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const now = new Date();

  const staticUrls = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${siteConfig.url}/explore`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/submit`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/refund`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...ideaUrls];
}
