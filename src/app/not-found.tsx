import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "페이지를 찾을 수 없습니다 — PatentPilot",
  description:
    "요청하신 페이지를 찾을 수 없습니다. PatentPilot 매물 찾기 또는 AI 코파일럿으로 이동해 보세요.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
      <div className="mb-6">
        <Logo variant="mark" height={56} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">
        404 · Not Found
      </p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
        길을 잃은 매물이네요.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
        요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
        <br className="hidden sm:inline" /> 아래에서 다시 출발해 보세요.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          홈으로
        </Link>
        <Link
          href="/market"
          className="rounded-md border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-brand hover:text-brand"
        >
          매물 찾기
        </Link>
        <Link
          href="/chat"
          className="rounded-md border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-brand hover:text-brand"
        >
          AI 코파일럿
        </Link>
      </div>

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
        <ShortcutCard
          href="/themes"
          title="기술분야별"
          body="IPC 섹션별 추천 매물"
        />
        <ShortcutCard
          href="/list"
          title="매물 등록"
          body="TLO·정출연 매도자 신청"
        />
        <ShortcutCard
          href="/apply"
          title="거래 신청"
          body="기업 매수 의향 LOI"
        />
      </div>

      <p className="mt-10 text-xs text-ink-400">
        도움이 필요하시면{" "}
        <a
          href="mailto:ethos614@gmail.com"
          className="text-brand hover:underline"
        >
          ethos614@gmail.com
        </a>
        으로 연락 주세요.
      </p>
    </section>
  );
}

function ShortcutCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-ink-100 bg-white p-4 text-left transition hover:border-brand hover:shadow-sm"
    >
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      <div className="mt-1 text-xs text-ink-500">{body}</div>
    </Link>
  );
}
