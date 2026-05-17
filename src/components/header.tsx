"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { CompareLink } from "./compare-link";

const LINKS = [
  { href: "/market", label: "매물" },
  { href: "/themes", label: "테마" },
  { href: "/chat", label: "AI 코파일럿" },
  { href: "/list", label: "매물 등록" },
  { href: "/apply", label: "거래 신청" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
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

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="배경 닫기"
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-ink-100 px-4">
              <Logo variant="mark" height={28} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-3 text-base font-medium text-ink-900 hover:bg-ink-50"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    href="/compare"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    📑 매물 비교
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="border-t border-ink-100 p-4">
              <Link
                href="/list"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-md bg-brand py-2.5 text-sm font-semibold text-white"
              >
                매물 등록 신청
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
