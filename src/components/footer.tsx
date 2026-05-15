import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-ink-50/50">
      <div className="container py-10 text-sm">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="text-base font-bold text-brand">PatentPilot</div>
            <p className="mt-2 text-ink-500">
              잠자는 한국 R&D 특허 7.8만건을 깨우는 매칭 코파일럿
            </p>
          </div>
          <div>
            <div className="font-semibold text-ink-900">서비스</div>
            <ul className="mt-2 space-y-1.5 text-ink-500">
              <li><Link href="/market" className="hover:text-brand">매물 찾기</Link></li>
              <li><Link href="/themes" className="hover:text-brand">기술분야별</Link></li>
              <li><Link href="/apply" className="hover:text-brand">거래 신청 · 매물 등록</Link></li>
              <li><Link href="/chat" className="hover:text-brand">AI 코파일럿 (베타)</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-ink-900">프로젝트</div>
            <ul className="mt-2 space-y-1.5 text-ink-500">
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
              <li>2026 지식재산 데이터 활용 창업 경진대회 출품작</li>
              <li>데이터 출처: KIPRIS Plus</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-100 pt-5 text-xs text-ink-300">
          © 2026 TreeO · PatentPilot
        </div>
      </div>
    </footer>
  );
}
