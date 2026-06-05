import { NextResponse, type NextRequest } from "next/server";
import { parseQuery, type ChatIntent } from "@/lib/chat-intent";
import { llmIntent, type ChatHistoryTurn } from "@/lib/llm-intent";
import { searchPatents, getPatentByAppNo } from "@/lib/patents";
import type { PatentRow } from "@/lib/types";
import { matchCompanies, type CompanyMatch } from "@/lib/matching";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { patentRank, patentRankGrade } from "@/lib/patent-rank";

function avgPatentRank(rows: PatentRow[]): { mean: number; gradeBreakdown: string } | null {
  if (rows.length === 0) return null;
  const scores = rows.map((p) => patentRank(p).overall);
  const mean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  // 등급 분포 짧은 요약
  const counts = new Map<string, number>();
  for (const s of scores) {
    const g = patentRankGrade(s).grade;
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const gradeBreakdown = ["S", "A", "B", "C", "D"]
    .filter((g) => (counts.get(g) ?? 0) > 0)
    .map((g) => `${g}${counts.get(g)}`)
    .join(" · ");
  return { mean, gradeBreakdown };
}

export interface ChatResponse {
  kind: "search" | "patent" | "smalltalk";
  reply: string;
  intent: ChatIntent;
  patents: PatentRow[];
  matches?: CompanyMatch[];
  total?: number;
  suggestions: string[];
  source: "llm" | "rule";
  model?: string;
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
  // 2단 캡: (1) 분당 10회 — 봇 차단 (2) 일일 30회 — OpenAI 비용 보호
  const rlBurst = rateLimit(req, "chat:min", 10, 60);
  if (!rlBurst.ok) {
    return NextResponse.json(
      { error: `너무 빠른 요청입니다. ${rlBurst.resetSec}초 후 다시 시도해주세요.` },
      { status: 429, headers: rateLimitHeaders(rlBurst) },
    );
  }
  const rlDay = rateLimit(req, "chat:day", 30, 24 * 3600);
  if (!rlDay.ok) {
    const hours = Math.ceil(rlDay.resetSec / 3600);
    return NextResponse.json(
      {
        error: `일일 AI 채팅 사용량(30회)을 초과했습니다. ${hours}시간 후 초기화됩니다. 매물 검색 기능은 그대로 사용 가능합니다.`,
      },
      { status: 429, headers: rateLimitHeaders(rlDay) },
    );
  }

  let body: { q?: string; history?: ChatHistoryTurn[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const q = (body.q ?? "").trim();
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });

  // 클라이언트가 보낸 history (직전 대화). user/assistant 형태로 검증
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history: ChatHistoryTurn[] = rawHistory
    .filter(
      (t): t is ChatHistoryTurn =>
        t !== null &&
        typeof t === "object" &&
        (t as ChatHistoryTurn).role !== undefined &&
        ((t as ChatHistoryTurn).role === "user" ||
          (t as ChatHistoryTurn).role === "assistant") &&
        typeof (t as ChatHistoryTurn).content === "string",
    )
    .slice(-10);

  // OPENAI_API_KEY가 있으면 LLM으로 의도 추출 (history 포함), 실패 시 룰베이스
  const llm = await llmIntent(q, history);
  const intent: ChatIntent = llm ?? parseQuery(q);
  const source: "llm" | "rule" = llm ? "llm" : "rule";
  const model = llm?.model;

  if (intent.kind === "patent" && intent.appNo) {
    const patent = await getPatentByAppNo(intent.appNo);
    if (!patent) {
      const res: ChatResponse = {
        kind: "patent",
        reply: `출원번호 ${intent.appNo}에 해당하는 매물을 찾지 못했어요. 출원번호는 \`10-2008-0001234\` 형태로 입력해주세요.`,
        intent,
        patents: [],
        suggestions: SUGGESTIONS,
        source,
        model,
      };
      return NextResponse.json(res);
    }
    const matches = await matchCompanies(patent, 5);
    const rank = patentRank(patent);
    const rankGrade = patentRankGrade(rank.overall);
    const lines = [
      `**${patent.title}**`,
      `${patent.university_name || patent.applicant} · ${patent.ipc_primary} · ${urgencyLabel(patent.urgency)}`,
      `청구항 ${patent.claims_count}개 · 피인용 ${patent.citation_count} · 패밀리 ${patent.family_count}`,
      `📊 PatentRank **${rank.overall}점 (${rankGrade.grade}등급)** — INV ${rank.inv} · IMP ${rank.imp} · MKT ${rank.mkt} · NET ${rank.net} · COM ${rank.com}`,
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
      source,
      model,
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
      source,
      model,
    };
    return NextResponse.json(res);
  }

  // 단계적 검색: 처음 0건이면 기관 → IPC → org 순으로 완화
  let result = await searchPatents(intent.params);
  const relaxedSteps: string[] = [];
  if (result.total === 0 && intent.params.university) {
    const r = await searchPatents({ ...intent.params, university: undefined });
    if (r.total > 0) {
      result = r;
      relaxedSteps.push("기관명 정확 일치가 없어 기관 조건을 풀었어요");
    }
  }
  if (result.total === 0 && intent.params.ipc) {
    const r = await searchPatents({
      ...intent.params,
      university: undefined,
      ipc: undefined,
    });
    if (r.total > 0) {
      result = r;
      relaxedSteps.push("IPC도 풀어서 검색했어요");
    }
  }
  if (result.total === 0 && intent.params.org && intent.params.org !== "ALL") {
    const r = await searchPatents({
      q: intent.params.q,
      sort: intent.params.sort,
      perPage: intent.params.perPage,
    });
    if (r.total > 0) {
      result = r;
      relaxedSteps.push("기관 유형도 풀어서 전체에서 찾았어요");
    }
  }

  const hintText = intent.labelHints.length
    ? `**${intent.labelHints.join(" · ")}** 조건으로 `
    : "";
  let reply: string;
  if (result.total === 0) {
    reply = `${hintText}매물을 찾지 못했어요. 검색어를 짧게 줄이거나 IPC/기관 조건을 빼고 다시 시도해보세요.`;
  } else {
    reply = `${hintText}활성 매물 **${result.total.toLocaleString("ko-KR")}건**을 찾았어요. 관련도 높은 순으로 ${result.rows.length}건을 보여드립니다.`;
    if (relaxedSteps.length) {
      reply += `\n\n_💡 ${relaxedSteps.join(" / ")}._`;
    }
    // PatentRank 한 줄 자동 추가
    const summary = avgPatentRank(result.rows);
    if (summary) {
      reply += `\n\n_📊 이 결과의 평균 PatentRank: **${summary.mean}점** (등급 분포: ${summary.gradeBreakdown})_`;
    }
  }

  const res: ChatResponse = {
    kind: "search",
    reply,
    intent,
    patents: result.rows,
    total: result.total,
    suggestions: SUGGESTIONS.filter((s) => !s.includes(intent.labelHints[0] ?? "")).slice(0, 4),
    source,
    model,
  };
  return NextResponse.json(res);
}
