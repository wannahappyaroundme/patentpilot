"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

interface Suggestion {
  label: string;
  hint: string;
  href: string;
}

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const v = q.trim();
    if (v.length < 1) {
      setItems([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(v)}`);
        const json = await res.json();
        setItems(json.suggestions ?? []);
        setOpen(true);
        setActive(-1);
      } catch {
        setItems([]);
      }
    }, 180);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  function pick(s: Suggestion) {
    track("search", { q, source: "suggest", target: s.label });
    setOpen(false);
    router.push(s.href);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      pick(items[active]);
      return;
    }
    const v = q.trim();
    if (!v) return;
    track("search", { q: v, source: "hero" });
    setOpen(false);
    router.push(`/market?q=${encodeURIComponent(v)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl">
      <form onSubmit={onSubmit}>
        <div className="flex items-center rounded-full border-2 border-brand bg-white pl-5 pr-2 shadow-card focus-within:border-brand-600">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => items.length > 0 && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="기관명, 기술 키워드, IPC 코드로 검색"
            className="h-12 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-300 focus:outline-none sm:h-14 sm:text-lg"
            aria-autocomplete="list"
            aria-expanded={open}
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

      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          <ul role="listbox">
            {items.map((s, i) => (
              <li key={`${s.label}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(s)}
                  className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm transition ${
                    i === active ? "bg-brand-50" : "hover:bg-ink-50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink-900">
                      {s.label}
                    </div>
                    <div className="truncate text-xs text-ink-500">{s.hint}</div>
                  </div>
                  <ArrowRight
                    size={14}
                    className={i === active ? "text-brand" : "text-ink-300"}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
