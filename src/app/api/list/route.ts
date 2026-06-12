import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listSchema, firstIssue } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Rate limit: IP당 1시간에 5회
  const rl = await rateLimit(req, "list", 5, 3600);
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

  const parsed = listSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot
  if (input.website_alt) {
    return NextResponse.json({ ok: true, id: 0, created_at: new Date().toISOString() });
  }

  const patentrankPublic = input.patentrank_public === "no" ? false : true;
  const row = {
    patent_application_number: input.patent_application_number || null,
    title: input.title,
    applicant: input.applicant,
    ipc_primary: input.ipc_primary,
    proposed_price: input.proposed_price,
    org_name: input.org_name,
    contact_name: input.contact_name,
    contact_email: input.contact_email,
    contact_phone: input.contact_phone,
    message: input.message,
    // Phase 2 — listings 테이블에 patentrank_public 컬럼 추가 후 활성화
    // 현재는 message 끝에 [PatentRank: 비공개] 메모로 운영자 알림
    ...(patentrankPublic === false
      ? { message: `${input.message}\n\n[운영자 메모: PatentRank 비공개 요청]` }
      : {}),
  };

  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("listings")
      .insert(row)
      .select("id, created_at")
      .single();
    if (error) {
      console.error("listings insert error", error);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }
    return NextResponse.json(
      { ok: true, id: data.id, created_at: data.created_at },
      { headers: rateLimitHeaders(rl) },
    );
  } catch (e) {
    console.error("listings fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}
