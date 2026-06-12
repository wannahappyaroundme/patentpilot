import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const ALLOWED_NAMES = new Set([
  "page_view",
  "click",
  "search",
  "loi_submit",
  "chat_query",
  "kipris_open",
]);

interface IncomingEvent {
  event_name?: string;
  path?: string;
  ref?: string;
  meta?: Record<string, unknown>;
  session_id?: string;
}

export async function POST(req: NextRequest) {
  // 플러딩 방어: IP당 1시간 300회 (실사용자는 페이지뷰당 수 건 수준)
  const rl = await rateLimit(req, "events", 300, 3600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let body: IncomingEvent | IncomingEvent[] = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  // 요청당 최대 20개 이벤트만 수용 (플러딩 방어)
  const list = (Array.isArray(body) ? body : [body]).slice(0, 20);
  const ua = req.headers.get("user-agent") ?? "";
  const rows = list
    .map((e) => ({
      event_name:
        typeof e.event_name === "string" && ALLOWED_NAMES.has(e.event_name)
          ? e.event_name
          : null,
      path: typeof e.path === "string" ? e.path.slice(0, 256) : "",
      ref: typeof e.ref === "string" ? e.ref.slice(0, 256) : "",
      meta:
        typeof e.meta === "object" &&
        e.meta !== null &&
        JSON.stringify(e.meta).length <= 2048
          ? e.meta
          : {},
      session_id:
        typeof e.session_id === "string" ? e.session_id.slice(0, 64) : "",
      user_agent: ua.slice(0, 256),
    }))
    .filter((r) => r.event_name !== null);

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  try {
    const sb = createServiceClient();
    const { error } = await sb.from("events").insert(rows);
    if (error) {
      console.error("events insert error", error);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("events fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}
