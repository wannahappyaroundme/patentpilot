"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
}

function detectOS(ua: string): string {
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function refDomain(ref: string): string {
  if (!ref) return "(direct)";
  try {
    const u = new URL(ref);
    const host = u.hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "(internal)";
    return host;
  } catch {
    return "(direct)";
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const ref = typeof document !== "undefined" ? document.referrer : "";
    track("page_view", {
      path: pathname,
      query: sp.toString(),
      device: detectDevice(ua),
      browser: detectBrowser(ua),
      os: detectOS(ua),
      ref_domain: refDomain(ref),
      utm_source: sp.get("utm_source") ?? undefined,
      utm_medium: sp.get("utm_medium") ?? undefined,
      utm_campaign: sp.get("utm_campaign") ?? undefined,
      lang:
        typeof navigator !== "undefined" ? navigator.language : undefined,
      screen_w: typeof window !== "undefined" ? window.innerWidth : undefined,
    });
  }, [pathname, sp]);

  return null;
}
