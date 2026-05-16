"use client";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  isFavorite,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import { track } from "@/lib/analytics";

interface Props {
  appNo: string;
  size?: number;
  variant?: "icon" | "labeled";
  className?: string;
}

export function FavoriteButton({
  appNo,
  size = 16,
  variant = "icon",
  className,
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(appNo));
    return subscribeFavorites(() => setSaved(isFavorite(appNo)));
  }, [appNo]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(appNo);
    track("click", { target: next ? "favorite_add" : "favorite_remove", appNo });
  }

  const Icon = saved ? BookmarkCheck : Bookmark;
  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
          saved
            ? "border-brand bg-brand-50 text-brand"
            : "border-ink-100 text-ink-700 hover:bg-ink-50"
        } ${className ?? ""}`}
      >
        <Icon size={size} />
        {saved ? "비교에 담김" : "비교에 담기"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "비교에서 빼기" : "비교에 담기"}
      title={saved ? "비교에서 빼기" : "비교에 담기"}
      className={`shrink-0 rounded-md p-1 transition ${
        saved ? "text-brand" : "text-ink-300 hover:bg-ink-50 hover:text-brand"
      } ${className ?? ""}`}
    >
      <Icon size={size} />
    </button>
  );
}
