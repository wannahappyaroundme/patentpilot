"use client";
import { useEffect, useState } from "react";
import { Sparkles, Bot } from "lucide-react";

const STAGES = [
  "질문 이해 중...",
  "AI가 매물 풀을 분석하고 있어요",
  "관련 매물을 추리는 중...",
  "매칭 후보를 정렬하는 중...",
];

export function ChatThinking() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setStage((i) => (i + 1) % STAGES.length);
    }, 1100);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex gap-2">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">
        <Bot size={14} />
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-brand opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-brand" />
        </span>
      </div>
      <div className="max-w-[80%] space-y-2">
        <div className="rounded-2xl bg-white px-4 py-2.5 text-sm leading-relaxed ring-1 ring-ink-100">
          <div className="flex items-center gap-2 text-brand">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              AI 코파일럿
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-ink-700">
            <span>{STAGES[stage]}</span>
            <span className="inline-flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-brand [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-brand [animation-delay:150ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-brand [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
