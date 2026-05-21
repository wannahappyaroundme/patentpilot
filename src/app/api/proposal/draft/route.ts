import { NextResponse, type NextRequest } from "next/server";
import { getPatentByAppNo } from "@/lib/patents";
import { matchCompanies } from "@/lib/matching";
import { patentRank, patentRankGrade, AXIS_META } from "@/lib/patent-rank";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export interface ProposalDraftResponse {
  subject: string;
  body: string;
  source: "llm" | "template";
  model?: string;
  patentRankOverall: number;
  patentRankGrade: string;
  topMatches: Array<{
    name: string;
    industry: string;
    score: number;
    matched_ipc: string;
  }>;
  recommendedBuyer: {
    name: string;
    industry: string;
    score: number;
  } | null;
}

/**
 * GPT를 호출해 매도자 측 → 매수 후보 기업으로 보낼
 * 거래 제안 메일 초안을 생성. 실제 발송 X — 매수자/운영자가 본문을 검토 후 사용.
 *
 * 입력: { appNo, buyerCompanyName?, buyerIndustry?, customNote? }
 * 출력: ProposalDraftResponse
 */
export async function POST(req: NextRequest) {
  // OpenAI 비용 보호: 분당 5회 + 일일 20회
  const rlBurst = rateLimit(req, "proposal:min", 5, 60);
  if (!rlBurst.ok) {
    return NextResponse.json(
      { error: `너무 빠른 요청입니다. ${rlBurst.resetSec}초 후 다시 시도해주세요.` },
      { status: 429, headers: rateLimitHeaders(rlBurst) },
    );
  }
  const rlDay = rateLimit(req, "proposal:day", 20, 24 * 3600);
  if (!rlDay.ok) {
    return NextResponse.json(
      {
        error:
          "일일 거래 제안 초안 생성 한도(20회)를 초과했습니다. 24시간 후 초기화됩니다.",
      },
      { status: 429, headers: rateLimitHeaders(rlDay) },
    );
  }

  let body: {
    appNo?: string;
    buyerCompanyName?: string;
    buyerIndustry?: string;
    customNote?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const appNo = (body.appNo ?? "").trim();
  if (!appNo) {
    return NextResponse.json({ error: "appNo is required" }, { status: 400 });
  }

  const patent = await getPatentByAppNo(appNo);
  if (!patent) {
    return NextResponse.json({ error: "patent not found" }, { status: 404 });
  }

  // PatentRank 5축 + 매칭 Top 5
  const rank = patentRank(patent);
  const grade = patentRankGrade(rank.overall);
  const matches = await matchCompanies(patent, 5);

  // 매수자 정보: 명시되었으면 그대로, 없으면 Top1 매칭 사용
  const top = matches[0] ?? null;
  const buyerCompanyName =
    body.buyerCompanyName?.trim() || top?.name || "(매수 후보 기업명)";
  const buyerIndustry =
    body.buyerIndustry?.trim() || top?.industry || "";

  // LLM으로 본문 생성
  const draft = await generateProposalBody({
    patent,
    rank,
    grade,
    buyerCompanyName,
    buyerIndustry,
    matchScore: top?.score ?? null,
    matchedIpc: top?.matched_ipc ?? "",
    customNote: body.customNote?.trim() || "",
  });

  const result: ProposalDraftResponse = {
    subject: draft.subject,
    body: draft.body,
    source: draft.source,
    model: draft.model,
    patentRankOverall: rank.overall,
    patentRankGrade: grade.grade,
    topMatches: matches.slice(0, 5).map((m) => ({
      name: m.name,
      industry: m.industry,
      score: m.score,
      matched_ipc: m.matched_ipc,
    })),
    recommendedBuyer: top
      ? { name: top.name, industry: top.industry, score: top.score }
      : null,
  };

  return NextResponse.json(result, { headers: rateLimitHeaders(rlDay) });
}

interface GenerateInput {
  patent: Awaited<ReturnType<typeof getPatentByAppNo>>;
  rank: ReturnType<typeof patentRank>;
  grade: ReturnType<typeof patentRankGrade>;
  buyerCompanyName: string;
  buyerIndustry: string;
  matchScore: number | null;
  matchedIpc: string;
  customNote: string;
}

async function generateProposalBody(
  input: GenerateInput,
): Promise<{ subject: string; body: string; source: "llm" | "template"; model?: string }> {
  const llm = await callOpenAi(input);
  if (llm) return llm;
  return { ...templateProposal(input), source: "template" };
}

async function callOpenAi(
  input: GenerateInput,
): Promise<{ subject: string; body: string; source: "llm"; model: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const p = input.patent;
  if (!p) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: key });

    const orgName = p.university_name || p.applicant;
    const orgType = p.org_type === "GRI" ? "정출연" : p.org_type === "UNIV" ? "대학 산학협력단" : "보유 기관";

    const system = `당신은 한국 R&D 특허 매매 중개 플랫폼 "PatentPilot" 운영팀입니다.
대학·정출연이 보유한 특허(매도자) 측을 대신해, 특정 기업(매수 후보)에게 보낼
간결하고 신뢰감 있는 한국어 비즈니스 메일 초안을 작성합니다.

스타일 가이드:
- 톤: 정중하면서 명확. 한국 기업 R&D 팀장 박상훈(40대 중반)이 받았을 때 위화감 없는 톤.
- 길이: 본문 220~320자 (지나치게 짧거나 길지 않게).
- 구성: (1) 매물 제목·기관 한 줄 소개 (2) 매수 후보 기업과의 핵심 매칭 근거 (3) PatentRank 5축 종합 점수 한 줄 (4) 다음 단계(짧은 미팅 제안) (5) 마무리 인사.
- 절대 금지: 가격 약속, 라이선스 조건 단정, 과장된 형용사("최고의", "혁명적인"), 이모지.
- 출처/링크는 본문에 넣지 않음 (별도 첨부 가정).
- 발신: "PatentPilot 운영팀 / ethos614@gmail.com"으로 마무리.

출력 형식 (JSON):
{
  "subject": "한 줄 제목 (40자 이내, 매물명·기관·핵심 매칭 키워드 포함)",
  "body": "본문 전체 (인사 포함, 줄바꿈 \\n 포함)"
}
JSON만 출력. 설명 금지.`;

    const user = `[매물 정보]
- 제목: ${p.title}
- 기관: ${orgName} (${orgType})
- 출원번호: ${p.application_number}
- 주 IPC: ${p.ipc_primary}
- 청구항: ${p.claims_count}개 / 피인용: ${p.citation_count} / 패밀리: ${p.family_count}
- R&D 사업: ${p.rnd_department || "(미공개)"}
- 잔여 권리기간: ${p.remaining_years ?? "?"}년
- 긴급도: ${p.urgency === "RED" ? "🔴 긴급" : p.urgency === "YELLOW" ? "🟡 임박" : "🟢 일반"}

[PatentRank 5축 점수 / 100]
- 종합: ${input.rank.overall} (등급 ${input.grade.grade})
- 혁신성 ${input.rank.inv} · 영향력 ${input.rank.imp} · 시장성 ${input.rank.mkt} · 중심성 ${input.rank.net} · 사업화 ${input.rank.com}

[매수 후보 기업]
- 기업명: ${input.buyerCompanyName}
- 산업: ${input.buyerIndustry || "(미지정)"}
- 매칭 점수: ${input.matchScore ?? "(N/A)"}
- 매칭 IPC: ${input.matchedIpc || "(N/A)"}

${input.customNote ? `[운영자 메모]\n${input.customNote}` : ""}

위 정보를 바탕으로 매수 후보 기업 R&D 책임자에게 보낼 메일 초안을 JSON으로 출력해주세요.`;

    const chain = ["gpt-5.4-nano", "gpt-5.4-mini", "gpt-4.1-mini"];

    for (const model of chain) {
      try {
        const isGpt5 = model.startsWith("gpt-5");
        const params = isGpt5
          ? {
              model,
              response_format: { type: "json_object" as const },
              messages: [
                { role: "system" as const, content: system },
                { role: "user" as const, content: user },
              ],
              max_completion_tokens: 700,
              reasoning_effort: "low" as const,
            }
          : {
              model,
              response_format: { type: "json_object" as const },
              messages: [
                { role: "system" as const, content: system },
                { role: "user" as const, content: user },
              ],
              max_tokens: 500,
              temperature: 0.3,
            };
        const resp = (await client.chat.completions.create(
          params as Parameters<typeof client.chat.completions.create>[0],
        )) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = resp.choices?.[0]?.message?.content ?? "";
        if (!text) continue;
        const parsed = JSON.parse(text) as { subject?: string; body?: string };
        if (!parsed.subject || !parsed.body) continue;
        return {
          subject: parsed.subject,
          body: parsed.body,
          source: "llm",
          model,
        };
      } catch (err) {
        console.warn(
          `proposal: OpenAI model ${model} failed`,
          err instanceof Error ? err.message : err,
        );
      }
    }
    return null;
  } catch (err) {
    console.error("proposal: OpenAI fatal", err);
    return null;
  }
}

function templateProposal(input: GenerateInput): { subject: string; body: string } {
  const p = input.patent!;
  const orgName = p.university_name || p.applicant;
  const orgType = p.org_type === "GRI" ? "정출연" : p.org_type === "UNIV" ? "대학 산학협력단" : "보유 기관";

  const subject = `[PatentPilot] ${orgName} ${p.ipc_primary} 특허 — ${input.buyerCompanyName} 매칭 제안`;

  const body = `${input.buyerCompanyName} R&D 담당자님께,

안녕하십니까. 한국 R&D 특허 매칭 코파일럿 PatentPilot 운영팀입니다.

${orgName}(${orgType})이 보유한 아래 특허가 귀사의 ${input.buyerIndustry || "사업 영역"}과 IPC 적합도 기준으로 높은 매칭률을 보여 제안드립니다.

— 매물: ${p.title}
— 출원번호: ${p.application_number}
— 주 IPC: ${p.ipc_primary} · 청구항 ${p.claims_count}개 · 피인용 ${p.citation_count}
— PatentRank 5축 종합: ${input.rank.overall}점 (등급 ${input.grade.grade}) — ${input.grade.desc}

특히 ${input.matchedIpc || p.ipc_primary} 영역에서 귀사의 기존 R&D 라인업과 보완 가능성이 큰 매물입니다. 권리자 측은 ${p.remaining_years ?? "?"}년의 잔여 권리기간 동안 라이선스 또는 양도 형태 모두 검토 가능합니다.

다음 단계로 15~20분 짧은 온라인 미팅을 통해 매물 상세·매도 조건·예상 거래 구조를 안내드리고 싶습니다. 회신으로 가능한 시간대를 알려주시면 매도 기관과 일정을 조율해 드리겠습니다.

PatentPilot 운영팀
ethos614@gmail.com
`;

  return { subject, body };
}
