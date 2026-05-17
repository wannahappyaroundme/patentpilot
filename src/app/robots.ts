import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://patentpilot-livid.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    // host: 비표준 항목 — Google/Naver 일부 파서가 거부함, Yandex 전용이라 제거
  };
}
