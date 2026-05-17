import type { MetadataRoute } from "next";

const BASE = "https://patentpilot-livid.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/market`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/themes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/chat`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/apply`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/list`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
