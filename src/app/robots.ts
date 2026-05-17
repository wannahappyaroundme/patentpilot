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
    host: base,
  };
}
