"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  bg: string;
  accent: string;
}

const BANNERS: Banner[] = [
  {
    title: "잠자는 한국 R&D 특허,\n깨어날 시간입니다.",
    subtitle: "유지비 부담으로 곧 포기될 대학·정출연 임박 매물 52,554건 (풀의 50.2%)",
    href: "/market?urgency=RED",
    cta: "🔴 긴급 매물 보기",
    bg: "bg-gradient-to-br from-brand-700 to-brand-500",
    accent: "text-brand-100",
  },
  {
    title: "기술이전 KPI,\n매물 등록으로 시작하세요.",
    subtitle: "TLO/산학협력단을 위한 매수 기업 자동 매칭",
    href: "/apply",
    cta: "매물 등록 신청",
    bg: "bg-gradient-to-br from-slate-900 to-slate-700",
    accent: "text-slate-300",
  },
  {
    title: "원하는 기술,\n한국에 이미 있을지도 모릅니다.",
    subtitle: "외주 R&D 비용을 아끼는 가장 빠른 방법",
    href: "/market",
    cta: "전체 매물 둘러보기",
    bg: "bg-gradient-to-br from-emerald-700 to-emerald-500",
    accent: "text-emerald-100",
  },
];

export function BannerSlider() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % BANNERS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {BANNERS.map((b, i) => (
          <Link
            key={i}
            href={b.href}
            className={`relative flex min-w-full flex-col justify-between p-8 sm:p-12 ${b.bg} aspect-[16/7] sm:aspect-[16/5]`}
          >
            <div>
              <div className={`mb-3 text-xs font-semibold uppercase tracking-widest ${b.accent}`}>
                PATENTPILOT
              </div>
              <h2 className="whitespace-pre-line text-2xl font-bold leading-tight text-white sm:text-4xl">
                {b.title}
              </h2>
              <p className={`mt-3 text-sm sm:text-base ${b.accent}`}>{b.subtitle}</p>
            </div>
            <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-white/20">
              {b.cta}
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIdx((i) => (i - 1 + BANNERS.length) % BANNERS.length)}
        aria-label="이전 배너"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => setIdx((i) => (i + 1) % BANNERS.length)}
        aria-label="다음 배너"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        <span className="font-semibold">{idx + 1}</span>
        <span className="text-white/60">/ {BANNERS.length}</span>
      </div>
    </section>
  );
}
