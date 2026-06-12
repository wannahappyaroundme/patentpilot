import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { loiSchema, firstIssue } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Rate limit: IP당 1시간에 5회
  const rl = await rateLimit(req, "loi", 5, 3600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `요청 한도를 초과했습니다. ${rl.resetSec}초 후 다시 시도해주세요.` },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = loiSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot: 사람이 안 채우는 hidden 필드. 봇이 채우면 fake-success로 응답.
  if (input.website_alt) {
    return NextResponse.json({ ok: true, id: 0, created_at: new Date().toISOString() });
  }

  const row = {
    patent_application_number: input.patent_application_number || null,
    company_name: input.company_name,
    contact_name: input.contact_name,
    contact_email: input.contact_email,
    contact_phone: input.contact_phone,
    proposed_amount: input.proposed_amount,
    message: input.message,
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
