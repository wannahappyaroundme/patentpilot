import Link from "next/link";

export const metadata = {
  title: "AI 코파일럿 (베타) — PatentPilot",
};

export default function ChatPage() {
  return (
    <div className="space-y-6 py-12">
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <div className="mx-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          BETA
        </div>
        <h1 className="mt-3 text-2xl font-bold">AI 코파일럿 (W3 stretch)</h1>
        <p className="mt-3 text-sm text-ink-500">
          자연어 질문 → 매물·매칭 추천. OpenAI text-embedding-3 + GPT-4o-mini 기반.
          <br />
          W3 (5/30~6/5)에 작업 예정.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
