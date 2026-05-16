import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50/50">
      <header className="border-b border-ink-100 bg-white">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo variant="mark" height={26} />
            <span className="text-sm font-semibold text-ink-700">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-ink-700 hover:bg-ink-50"
            >
              대시보드
            </Link>
            <Link
              href="/admin/applications"
              className="rounded-md px-3 py-1.5 text-ink-700 hover:bg-ink-50"
            >
              거래 신청
            </Link>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-brand hover:bg-brand-50"
            >
              ↗ 사이트로
            </Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
