import { NextResponse, type NextRequest } from "next/server";
import { parseQuery, type ChatIntent } from "@/lib/chat-intent";
import { searchPatents, getPatentByAppNo } from "@/lib/patents";
import type { PatentRow } from "@/lib/types";
import { matchCompanies, type CompanyMatch } from "@/lib/matching";

export interface ChatResponse {
  kind: "search" | "patent" | "smalltalk";
  reply: string;
  intent: ChatIntent;
  patents: PatentRow[];
  matches?: CompanyMatch[];
  total?: number;
  suggestions: string[];
}

const SMALLTALK_PROMPT =
  "도와드릴 검색 예시를 알려드릴게요. 아래 추천 질문 중 하나를 골라보세요.";

const SUGGESTIONS = [
  "ETRI 긴급 매물 보여줘",
  "삼성전자가 살 만한 반도체 매물",
  "배터리 정출연 매물 인용 많은 순",
  "KAIST 디스플레이 특허",
  "곧 만료될 바이오 신약 특허",
];

function urgencyLabel(u: string | undefined): string {
  if (u === "RED") return "🔴 긴급";
  if (u === "YELLOW") return "🟡 임박";
  if (u === "GREEN") return "🟢 일반";
  return "활성";
}

export async function POST(req: NextRequest) {
  let body: { q?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const q = (body.q ?? "").trim();
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });

  const intent = parseQuery(q);

  if (intent.kind === "patent" && intent.appNo) {
    const patent = await getPatentByAppNo(intent.appNo);
    if (!patent) {
      const res: ChatResponse = {
        kind: "patent",
        reply: `출원번호 ${intent.appNo}에 해당하는 매물을 찾지 못했어요. 출원번호는 \`10-2008-0001234\` 형태로 입력해주세요.`,
        intent,
        patents: [],
        suggestions: SUGGESTIONS,
      };
      return NextResponse.json(res);
    }
    const matches = await matchCompanies(patent, 5);
    const lines = [
      `**${patent.title}**`,
      `${patent.university_name || patent.applicant} · ${patent.ipc_primary} · ${urgencyLabel(patent.urgency)}`,
      `청구항 ${patent.claims_count}개 · 피인용 ${patent.citation_count} · 패밀리 ${patent.family_count}`,
      matches.length
        ? `매수 후보 Top: ${matches.slice(0, 3).map((m) => `${m.name}(${m.score}점)`).join(", ")}`
        : `매수 후보 시드에 매핑된 기업이 아직 없어요.`,
    ];
    const res: ChatResponse = {
      kind: "patent",
      reply: lines.join("\n"),
      intent,
      patents: [patent],
      matches,
      suggestions: [
        `${patent.application_number} 거래 신청`,
        `${patent.university_name || patent.applicant} 의 다른 매물`,
        "비슷한 IPC 매물 더 보여줘",
      ],
    };
    return NextResponse.json(res);
  }

  if (intent.kind === "smalltalk") {
    const res: ChatResponse = {
      kind: "smalltalk",
      reply: SMALLTALK_PROMPT,
      intent,
      patents: [],
      suggestions: SUGGESTIONS,
    };
    return NextResponse.json(res);
  }

  const result = await searchPatents(intent.params);
  const hintText = intent.labelHints.length
    ? `**${intent.labelHints.join(" · ")}** 조건으로 `
    : "";
  const reply =
    result.total === 0
      ? `${hintText}매물을 찾지 못했어요. 조건을 더 풀어보세요.`
      : `${hintText}활성 매물 **${result.total.toLocaleString("ko-KR")}건**을 찾았어요. 관련도 높은 순으로 ${result.rows.length}건을 보여드립니다.`;

  const res: ChatResponse = {
    kind: "search",
    reply,
    intent,
    patents: result.rows,
    total: result.total,
    suggestions: SUGGESTIONS.filter((s) => !s.includes(intent.labelHints[0] ?? "")).slice(0, 4),
  };
  return NextResponse.json(res);
}
