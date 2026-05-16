"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { track, type EventName } from "@/lib/analytics";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  event?: EventName;
  meta?: Record<string, unknown>;
  external?: boolean;
  ariaLabel?: string;
}

export function TrackedLink({
  href,
  children,
  className,
  event = "click",
  meta = {},
  external = false,
  ariaLabel,
}: Props) {
  function onClick() {
    track(event, meta);
  }
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  );
}
