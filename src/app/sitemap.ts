import type { MetadataRoute } from "next";

const BASE = "https://patentpilot-livid.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // 날짜만 (시간/타임존 제거) — Google sitemap 파서가 가장 안전하게 인식
  const today = new Date().toISOString().split("T")[0]!;
  return [
    { url: `${BASE}/`, lastModified: today, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/market`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/themes`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/chat`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/apply`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/list`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/compare`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
  ];
}
