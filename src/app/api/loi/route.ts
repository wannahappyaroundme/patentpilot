import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: IP당 1시간에 5회
  const rl = rateLimit(req, "loi", 5, 3600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `요청 한도를 초과했습니다. ${rl.resetSec}초 후 다시 시도해주세요.` },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const get = (k: string) => {
    const v = body[k];
    return typeof v === "string" ? v.trim() : "";
  };

  // Honeypot: 사람이 안 채우는 hidden 필드. 봇이 채우면 fake-success로 응답.
  if (get("website_alt")) {
    return NextResponse.json({ ok: true, id: 0, created_at: new Date().toISOString() });
  }

  const company_name = get("company_name");
  const contact_name = get("contact_name");
  const contact_email = get("contact_email");

  if (!company_name || !contact_name || !contact_email) {
    return NextResponse.json(
      { error: "company_name, contact_name, contact_email은 필수입니다." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return NextResponse.json({ error: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const row = {
    patent_application_number: get("patent_application_number") || null,
    company_name,
    contact_name,
    contact_email,
    contact_phone: get("contact_phone"),
    proposed_amount: get("proposed_amount"),
    message: get("message"),
  };

  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("applications")
      .insert(row)
      .select("id, created_at")
      .single();
    if (error) {
      console.error("loi insert error", error);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }
    return NextResponse.json(
      { ok: true, id: data.id, created_at: data.created_at },
      { headers: rateLimitHeaders(rl) },
    );
  } catch (e) {
    console.error("loi fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}
