import { MetadataRoute } from "next";

import { siteConfig } from "@/lib/metadata";
import { getIdeas } from "./(public)/(with-nav)/explore/get-ideas";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ideasResponse = await getIdeas({ limit: 1000, offset: 0 });
  const ideas = ideasResponse?.ideas ?? [];

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
