"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

export function PageViewTracker() {
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    track("page_view", { path: pathname, query: sp.toString() });
  }, [pathname, sp]);

  return null;
}
