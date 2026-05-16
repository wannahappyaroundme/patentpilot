"use client";

const SESSION_KEY = "pp_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        "s_" +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36).slice(-6);
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export type EventName =
  | "page_view"
  | "click"
  | "search"
  | "loi_submit"
  | "chat_query"
  | "kipris_open";

export function track(
  event_name: EventName,
  meta: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const payload = {
    event_name,
    path: window.location.pathname + window.location.search,
    ref: document.referrer,
    session_id: getSessionId(),
    meta,
  };
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }
  } catch {
    // fall through to fetch
  }
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // swallow
  });
}
