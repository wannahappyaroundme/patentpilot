import Link from "next/link";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="PatentPilot">
            <svg
              width="180"
              height="26"
              viewBox="0 0 210 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <text
                x="0"
                y="22"
                fontFamily="Pretendard, sans-serif"
                fontWeight="800"
                fontSize="22"
                fill="#006EFF"
              >
                PatentPilot
              </text>
            </svg>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
            <Link href="/market" className="hover:text-brand">매물</Link>
            <Link href="/themes" className="hover:text-brand">테마</Link>
            <Link href="/about" className="hover:text-brand">서비스 소개</Link>
            <Link href="/apply" className="hover:text-brand">거래 신청</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
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
