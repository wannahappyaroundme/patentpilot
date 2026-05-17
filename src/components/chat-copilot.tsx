"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, Trash2 } from "lucide-react";
import type { PatentRow } from "@/lib/types";
import type { CompanyMatch } from "@/lib/matching";
import { track } from "@/lib/analytics";
import { urgencyLabel } from "@/lib/format";
import { ChatThinking } from "./chat-thinking";

const STORAGE_KEY = "pp_chat_messages";
const MAX_SAVED = 40;

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  text: string;
  patents?: PatentRow[];
  matches?: CompanyMatch[];
  suggestions?: string[];
  total?: number;
  source?: "llm" | "rule";
  model?: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text:
    "안녕하세요. PatentPilot AI 코파일럿입니다. 자연어로 매물을 찾아드릴게요. 예) **\"ETRI 긴급 매물\"**, **\"삼성전자가 살 만한 반도체 특허\"**, **\"KAIST 디스플레이\"**",
  suggestions: [
    "ETRI 긴급 매물 보여줘",
    "삼성전자가 살 만한 반도체 매물",
    "배터리 정출연 매물 인용 많은 순",
    "KAIST 디스플레이 특허",
  ],
};

export function ChatCopilot() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // 1) localStorage에서 이전 대화 복원 (mount 1회만)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed as Message[]);
        }
      }
    } catch {
      // 파싱 실패 시 무시
    }
    setHydrated(true);
  }, []);

  // 2) messages 변경 시 localStorage에 저장 (hydration 끝난 후만)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const toSave = messages.slice(-MAX_SAVED);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // 용량 초과 등 무시
    }
  }, [messages, hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function resetChat() {
    setMessages([WELCOME]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    track("click", { target: "chat_reset" });
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    track("chat_query", { q });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: q,
    };
    setMessages((m) => [...m, userMsg]);

    // 직전 대화 N턴을 함께 보내서 LLM이 컨텍스트를 이해하도록
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m) => m.id !== "welcome")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, history }),
      });
      const json = await res.json();
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: json.reply ?? "응답을 받지 못했어요.",
        patents: json.patents ?? [],
        matches: json.matches ?? [],
        suggestions: json.suggestions ?? [],
        total: json.total,
        source: json.source,
        model: json.model,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">AI 코파일럿 (베타)</div>
          <div className="text-xs text-ink-500">
            자연어 질문으로 매물을 찾아드립니다. 대화는 브라우저에 자동 저장돼요.
          </div>
        </div>
        {messages.length > 1 && (
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-50 hover:text-red-500"
            title="대화 기록 초기화"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">대화 초기화</span>
          </button>
        )}
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto bg-ink-50/40 px-4 py-6">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} onSuggestion={send} />
        ))}
        {loading && <ChatThinking />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-ink-100 bg-white p-3"
      >
        <div className="flex items-center gap-2 rounded-full border-2 border-ink-100 bg-white pl-4 pr-1 focus-within:border-brand">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="예: ETRI 곧 만료 배터리 매물"
            className="h-11 flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-600 disabled:opacity-50"
            aria-label="전송"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({
  message,
  onSuggestion,
}: {
  message: Message;
  onSuggestion?: (q: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-ink-900 text-white" : "bg-brand-50 text-brand"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : ""}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-ink-900 text-white"
              : "bg-white text-ink-900 ring-1 ring-ink-100"
          }`}
        >
          <RichText text={message.text} />
        </div>

        {!isUser && message.source && (
          <div className="text-[10px] text-ink-300">
            {message.source === "llm" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand">
                ✨ AI · {message.model ?? "GPT"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 font-medium text-ink-500">
                rule-based fallback
              </span>
            )}
          </div>
        )}

        {message.patents && message.patents.length > 0 && (
          <div className="space-y-2">
            {message.patents.slice(0, 5).map((p) => (
              <Link
                key={p.application_number}
                href={`/patent/${encodeURIComponent(p.application_number)}`}
                className="block rounded-xl border border-ink-100 bg-white p-3 text-left transition hover:border-brand-200 hover:shadow-card"
              >
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="rounded-full bg-red-50 px-1.5 py-0.5 font-medium text-red-700">
                    {urgencyLabel(p.urgency)}
                  </span>
                  <span className="rounded-full bg-brand-50 px-1.5 py-0.5 font-medium text-brand">
                    {p.org_type === "GRI" ? "정출연" : p.org_type === "UNIV" ? "대학" : "기타"}
                  </span>
                  {p.ipc_primary && (
                    <span className="text-ink-300">{p.ipc_primary}</span>
                  )}
                </div>
                <div className="mt-1 line-clamp-2 text-sm font-semibold text-ink-900">
                  {p.title || p.application_number}
                </div>
                <div className="mt-0.5 text-xs text-ink-500">
                  {p.university_name || p.applicant}
                </div>
              </Link>
            ))}
            {message.total && message.total > 5 && (
              <Link
                href={buildMarketHref(message)}
                className="block rounded-xl border border-dashed border-ink-200 p-3 text-center text-xs text-ink-500 hover:bg-ink-50"
              >
                전체 {message.total.toLocaleString("ko-KR")}건 매물 페이지에서 보기 →
              </Link>
            )}
          </div>
        )}

        {message.suggestions && message.suggestions.length > 0 && onSuggestion && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-ink-100 bg-white px-3 py-1 text-xs text-ink-700 hover:border-brand-200 hover:text-brand"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildMarketHref(_m: Message): string {
  // 채팅 응답에 사용된 intent를 직접 알 수 없으므로 안전한 fallback
  return "/market";
}

function RichText({ text }: { text: string }) {
  // 간단한 **bold** 표기 지원
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
