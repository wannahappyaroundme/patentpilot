const KEY = "pp_favorites";
const EVENT = "pp:favorites";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(list: string[]): void {
  if (typeof window === "undefined") return;
  const uniq = Array.from(new Set(list)).slice(0, 20);
  window.localStorage.setItem(KEY, JSON.stringify(uniq));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function toggleFavorite(appNo: string): boolean {
  const cur = readFavorites();
  const exists = cur.includes(appNo);
  const next = exists ? cur.filter((s) => s !== appNo) : [...cur, appNo];
  writeFavorites(next);
  return !exists;
}

export function reorderFavorites(fromIdx: number, toIdx: number): void {
  const cur = readFavorites();
  if (
    fromIdx < 0 ||
    fromIdx >= cur.length ||
    toIdx < 0 ||
    toIdx >= cur.length ||
    fromIdx === toIdx
  )
    return;
  const next = [...cur];
  const [moved] = next.splice(fromIdx, 1);
  if (moved === undefined) return;
  next.splice(toIdx, 0, moved);
  writeFavorites(next);
}

export function isFavorite(appNo: string): boolean {
  return readFavorites().includes(appNo);
}

export function subscribeFavorites(cb: (list: string[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb(readFavorites());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
