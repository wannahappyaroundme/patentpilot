"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { CompareLink } from "./compare-link";
import { MobileDrawer } from "./mobile-drawer";

const LINKS = [
  { href: "/market", label: "매물" },
  { href: "/themes", label: "테마" },
  { href: "/chat", label: "AI 코파일럿" },
  { href: "/list", label: "매물 등록" },
  { href: "/apply", label: "거래 신청" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-8">
            <Link href="/" className="flex items-center" aria-label="PatentPilot">
              <Logo variant="full" height={26} className="hidden sm:block" />
              <Logo variant="mark" height={28} className="sm:hidden" />
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 lg:flex">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-brand">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <CompareLink />
            <Link
              href="/list"
              className="hidden rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 lg:inline-flex"
            >
              매물 등록
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer open={open} onClose={() => setOpen(false)} links={LINKS} />
    </>
  );
}
