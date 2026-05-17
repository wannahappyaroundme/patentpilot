import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-50/40">
      <div className="container py-10 text-sm">
        <div className="grid gap-8 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo variant="full" height={24} />
            <p className="mt-3 max-w-sm text-ink-500">
              잠자는 한국 R&D 특허 158,777건을 깨우는 매칭 코파일럿.
              <br className="hidden sm:inline" /> 매물 발굴부터 거래 매칭, 거래 신청까지 한 자리에서.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">서비스</div>
            <ul className="mt-3 space-y-1.5 text-ink-700">
              <li><Link href="/market" className="hover:text-brand">매물 찾기</Link></li>
              <li><Link href="/themes" className="hover:text-brand">기술분야별</Link></li>
              <li><Link href="/chat" className="hover:text-brand">AI 코파일럿</Link></li>
              <li><Link href="/compare" className="hover:text-brand">매물 비교</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">거래·문의</div>
            <ul className="mt-3 space-y-1.5 text-ink-700">
              <li><Link href="/list" className="hover:text-brand">매물 등록 (매도)</Link></li>
              <li><Link href="/apply" className="hover:text-brand">거래 신청 (매수)</Link></li>
              <li><Link href="/about" className="hover:text-brand">서비스 소개</Link></li>
              <li>
                <a
                  href="mailto:ethos614@gmail.com?subject=PatentPilot%20%EB%AC%B8%EC%9D%98"
                  className="hover:text-brand"
                >
                  이메일 문의
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wannahappyaroundme/patentpilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand"
                >
                  GitHub
                </a>
              </li>
            </ul>
            <div className="mt-3 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-500">
              <div className="font-medium text-ink-700">업무 협약·데이터 문의</div>
              <a
                href="mailto:ethos614@gmail.com"
                className="text-brand hover:underline"
              >
                ethos614@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5 text-xs text-ink-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 TreeO · PatentPilot</span>
            <span className="text-ink-300">·</span>
            <Link href="/privacy" className="hover:text-brand">
              개인정보처리방침
            </Link>
            <span className="text-ink-300">·</span>
            <Link href="/terms" className="hover:text-brand">
              이용약관
            </Link>
            <span className="text-ink-300">·</span>
            <Link href="/en" className="hover:text-brand">
              English
            </Link>
          </div>
          <span>2026 지식재산 데이터 활용 창업 경진대회 · 데이터 출처: KIPRIS Plus</span>
        </div>
      </div>
    </footer>
  );
}
