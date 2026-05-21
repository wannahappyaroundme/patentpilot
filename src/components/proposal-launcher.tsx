"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, X, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import type { PatentRow } from "@/lib/types";
import { track } from "@/lib/analytics";

interface Props {
  patent: PatentRow;
}

interface DraftResponse {
  subject: string;
  body: string;
  source: "llm" | "template";
  model?: string;
  patentRankOverall: number;
  patentRankGrade: string;
  topMatches: Array<{
    name: string;
    industry: string;
    score: number;
    matched_ipc: string;
  }>;
  recommendedBuyer: { name: string; industry: string; score: number } | null;
}

/**
 * 매물 상세 사이드바에 들어가는 "거래 제안 메일 초안" 런처.
 * 클릭 → /api/proposal/draft 호출 → 모달에서 본문 미리보기 + 수정 + 복사.
 * 실제 메일 발송은 X. 사용자가 본문을 검토 후 자기 메일 클라이언트로 사용.
 */
export function ProposalLauncher({ patent }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track("click", { target: "proposal_launcher", appNo: patent.application_number });
          setOpen(true);
        }}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand bg-white px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
      >
        <Sparkles size={14} />
        AI 거래 제안 메일 초안 생성
      </button>
      {open && <ProposalModal patent={patent} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProposalModal({
  patent,
  onClose,
}: {
  patent: PatentRow;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자가 수정 가능한 상태
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // 매수자 정보 — 선택된 Top 매칭 또는 사용자 직접 입력
  const [buyerCompanyName, setBuyerCompanyName] = useState("");
  const [customNote, setCustomNote] = useState("");

  const [copied, setCopied] = useState<"subject" | "body" | "full" | null>(null);

  async function generate(payload?: {
    buyerCompanyName?: string;
    customNote?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proposal/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNo: patent.application_number,
          buyerCompanyName: payload?.buyerCompanyName ?? buyerCompanyName ?? undefined,
          customNote: payload?.customNote ?? customNote ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "초안 생성 실패");
      setDraft(json);
      setSubject(json.subject);
      setBody(json.body);
      if (!buyerCompanyName && json.recommendedBuyer) {
        setBuyerCompanyName(json.recommendedBuyer.name);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // ESC로 닫기
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // 첫 생성
    generate();
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyText(text: string, key: "subject" | "body" | "full") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      track("click", { target: `proposal_copy_${key}`, appNo: patent.application_number });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI 거래 제안 메일 초안"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
              <Sparkles size={16} className="text-brand" />
              AI 거래 제안 메일 초안
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {patent.title.slice(0, 60)}
              {patent.title.length > 60 ? "…" : ""} · {patent.application_number}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 매칭 정보 */}
          {draft && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 text-xs">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-brand">
                  PatentRank {draft.patentRankOverall} · 등급 {draft.patentRankGrade}
                </span>
                {draft.source === "llm" && draft.model && (
                  <span className="text-ink-500">생성 모델: {draft.model}</span>
                )}
                {draft.source === "template" && (
                  <span className="text-ink-500">템플릿 모드 (OPENAI_API_KEY 없음)</span>
                )}
              </div>
              {draft.topMatches.length > 0 && (
                <div className="mt-3">
                  <div className="font-semibold text-ink-700">매칭 Top 5</div>
                  <ul className="mt-1.5 space-y-1">
                    {draft.topMatches.map((m, i) => (
                      <li key={m.name} className="flex items-baseline justify-between">
                        <span>
                          <span className="font-mono text-ink-400">#{i + 1}</span>{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setBuyerCompanyName(m.name);
                              generate({ buyerCompanyName: m.name });
                            }}
                            className="font-semibold text-ink-900 hover:text-brand"
                          >
                            {m.name}
                          </button>{" "}
                          <span className="text-ink-500">· {m.industry}</span>
                        </span>
                        <span className="font-mono text-brand">{m.score}점</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[10px] text-ink-400">
                    회사명 클릭 시 해당 회사 기준으로 메일 본문 재생성.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 수신자 입력 */}
          <section className="space-y-2">
            <label className="text-xs font-semibold text-ink-700">
              수신 매수 후보 기업
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={buyerCompanyName}
                onChange={(e) => setBuyerCompanyName(e.target.value)}
                placeholder="예: 삼성SDI 주식회사"
                className="flex-1 rounded-md border border-ink-100 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={() => generate()}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                재생성
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-xs font-semibold text-ink-700">
              운영자 메모 (선택) — 본문에 반영됩니다
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="예: 매도 기관이 이번 분기 매각 적극적임. 라이선스보다 양도 선호."
              className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-xs focus:border-brand focus:outline-none"
            />
          </section>

          {/* 제목 */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink-700">제목</label>
              <button
                type="button"
                onClick={() => copyText(subject, "subject")}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                {copied === "subject" ? <Check size={12} /> : <Copy size={12} />}
                {copied === "subject" ? "복사됨" : "제목 복사"}
              </button>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:bg-ink-50"
            />
          </section>

          {/* 본문 */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink-700">본문</label>
              <button
                type="button"
                onClick={() => copyText(body, "body")}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                {copied === "body" ? <Check size={12} /> : <Copy size={12} />}
                {copied === "body" ? "복사됨" : "본문 복사"}
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              disabled={loading}
              className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm leading-relaxed focus:border-brand focus:outline-none disabled:bg-ink-50"
            />
            <div className="text-right text-[10px] text-ink-400">
              {body.length}자
            </div>
          </section>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-ink-500">
              <Loader2 size={16} className="animate-spin" />
              GPT가 본문 작성 중...
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/40 px-6 py-4">
          <p className="text-[11px] text-ink-500 sm:max-w-md">
            ⚠️ <b>실제 발송은 안 됩니다.</b> 본문을 검토·수정 후 복사해서 사용하시거나,
            운영자 검토를 거치려면 ethos614@gmail.com 로 전달하세요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => copyText(`제목: ${subject}\n\n${body}`, "full")}
              disabled={loading || !body}
              className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60"
            >
              {copied === "full" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "full" ? "전체 복사됨" : "전체 복사"}
            </button>
            <a
              href={`mailto:ethos614@gmail.com?subject=${encodeURIComponent(`[PatentPilot 검토 요청] ${subject}`)}&body=${encodeURIComponent(`매물: ${patent.title}\n출원번호: ${patent.application_number}\n수신 매수 후보: ${buyerCompanyName || "(미정)"}\n\n--- 작성된 본문 ---\n\n${body}`)}`}
              onClick={() => track("click", { target: "proposal_forward_ops", appNo: patent.application_number })}
              className="inline-flex items-center gap-1 rounded-md border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
            >
              <Mail size={14} />
              운영자 검토 요청
            </a>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
