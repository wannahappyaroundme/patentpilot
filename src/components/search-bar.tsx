"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/market?q=${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="flex items-center rounded-full border-2 border-brand bg-white pl-5 pr-2 shadow-card focus-within:border-brand-600">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="기관명, 기술 키워드, IPC 코드로 검색"
          className="h-12 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-300 focus:outline-none sm:h-14 sm:text-lg"
        />
        <button
          type="submit"
          aria-label="검색"
          className="flex h-10 w-10 items-center justify-center rounded-full text-brand transition hover:bg-brand-50 sm:h-11 sm:w-11"
        >
          <Search size={22} />
        </button>
      </div>
    </form>
  );
}
