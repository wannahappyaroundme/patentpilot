"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkCheck } from "lucide-react";
import { readFavorites, subscribeFavorites } from "@/lib/favorites";

export function CompareLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readFavorites().length);
    return subscribeFavorites((list) => setCount(list.length));
  }, []);

  return (
    <Link
      href="/compare"
      className="relative inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-ink-700 hover:text-brand"
      aria-label={`매물 비교 ${count}건`}
      title="매물 비교"
    >
      <BookmarkCheck size={16} />
      <span className="hidden sm:inline">비교</span>
      {count > 0 && (
        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
