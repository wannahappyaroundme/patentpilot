import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import { CompareLink } from "./compare-link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="PatentPilot">
            <Logo variant="full" height={26} className="hidden sm:block" />
            <Logo variant="mark" height={28} className="sm:hidden" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
            <Link href="/market" className="hover:text-brand">매물</Link>
            <Link href="/themes" className="hover:text-brand">테마</Link>
            <Link href="/chat" className="hover:text-brand">AI 코파일럿</Link>
            <Link href="/list" className="hover:text-brand">매물 등록</Link>
            <Link href="/apply" className="hover:text-brand">거래 신청</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <CompareLink />
          <button
            type="button"
            aria-label="검색"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50"
          >
            <Search size={18} />
          </button>
          <Link
            href="/apply"
            className="hidden rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 md:inline-flex"
          >
            매물 등록
          </Link>
        </div>
      </div>
    </header>
  );
}
