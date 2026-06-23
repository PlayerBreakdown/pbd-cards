import type { MetadataRoute } from "next";
import { cardsIndex } from "@/lib/cardIndex";

const baseUrl = "https://playerbreakdowncards.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/cards`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ballon-dor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/info`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const cardPages: MetadataRoute.Sitemap = cardsIndex.map((card) => ({
    url: `${baseUrl}/cards/${card.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
    images: card.image_url ? [`${baseUrl}${card.image_url}`] : undefined,
  }));

  return [...corePages, ...cardPages];
}
