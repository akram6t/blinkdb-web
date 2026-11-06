import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-06");
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/docs/usage`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/docs/benchmarks`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
