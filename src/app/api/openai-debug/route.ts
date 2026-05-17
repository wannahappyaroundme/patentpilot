/**
 * Admin 디버그: OpenAI 계정에서 호출 가능한 모델 목록 + 우리 체인 시도 결과.
 * /admin Basic Auth로 보호되지 않으니, 인증된 admin token이 query string에 있을 때만 응답.
 */
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CANDIDATES = [
  "gpt-5.5",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o",
  "gpt-4o-mini",
];

export async function GET(req: NextRequest) {
  const expected = (process.env.ADMIN_PASSWORD ?? "").trim();
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });

  // 1) 전체 모델 목록
  let allModels: string[] = [];
  try {
    const res = await client.models.list();
    allModels = (res.data ?? []).map((m) => m.id);
  } catch (e) {
    return NextResponse.json({ error: "models.list failed", detail: String(e) }, { status: 500 });
  }

  // 2) 각 candidate에 대해 mini call 시도
  const trial: Array<{ model: string; ok: boolean; error?: string }> = [];
  for (const model of CANDIDATES) {
    try {
      const r = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
      });
      trial.push({ model, ok: !!r.choices[0]?.message });
    } catch (e) {
      trial.push({ model, ok: false, error: e instanceof Error ? e.message.slice(0, 200) : "error" });
    }
  }

  return NextResponse.json({
    total_models_in_account: allModels.length,
    gpt5_models_in_list: allModels.filter((m) => m.startsWith("gpt-5")).sort(),
    gpt4_models_in_list: allModels.filter((m) => m.startsWith("gpt-4")).sort(),
    trial,
  });
}
