import type { SearchParams } from "./patents";
import type { Urgency, OrgType } from "./types";

interface LlmIntent {
  kind: "search" | "patent" | "smalltalk";
  params: SearchParams;
  appNo?: string;
  labelHints: string[];
  raw: string;
}

const SYSTEM_PROMPT = `당신은 한국 R&D 특허 매물 매칭 서비스 "PatentPilot"의 검색 비서입니다.
사용자의 한국어 자연어 질문을 받아 검색 의도를 추출해 JSON으로 출력합니다.

규칙:
- "kind": "search" | "patent" | "smalltalk" 중 하나
- "search": 매물 목록을 찾고 싶을 때
- "patent": 특정 출원번호(예: 10-2008-0001234)에 대한 질문일 때
- "smalltalk": 검색 의도가 명확하지 않거나 일반 대화일 때
- "params": SearchParams 객체 (urgency / org / ipc / university / sort)
  - urgency: "RED" (긴급/15-20년차/곧 만료), "YELLOW" (임박/8-14년차), "GREEN" (일반), 미언급 시 생략
  - org: "UNIV" (대학/산학협력단), "GRI" (정출연/연구원/연구소/ETRI/KAIST/KIST)
  - ipc: 콤마 구분 IPC prefix (예: "H01M,B60L" 배터리, "H01L,G11C" 반도체, "A61K,C07K,C12N" 바이오, "G09G" 디스플레이, "B60K,B60W,B62D" 모빌리티, "H04W,H04L" 통신, "G06N,G06F" AI/SW, "C08F,C08L,C09K" 화학소재, "B63B,F17C" 조선, "B64C,F02C,F41H" 항공방산)
  - university: 정확한 기관명 (예: "한국전자통신연구원", "한국과학기술원", "연세대학교")
  - sort: "urgency" (기본), "recent" (최신순), "citations" (피인용순), "claims" (청구항순), "transfers" (권리이동순)
- "appNo": kind=patent일 때만 "10-YYYY-NNNNNNN" 형식
- "labelHints": 사용자에게 보여줄 한국어 라벨 배열 (예: ["🔴 긴급 매물", "정출연", "배터리·2차전지"])

JSON만 출력. 설명 금지.`;

async function callOpenAi(q: string): Promise<LlmIntent | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: key });
    const primaryModel = process.env.OPENAI_CHAT_MODEL ?? "gpt-5-mini";
    const fallbackModel = "gpt-4.1-mini";

    let resp;
    try {
      resp = await client.chat.completions.create({
        model: primaryModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: q },
        ],
        temperature: 0.2,
        max_tokens: 400,
      });
    } catch (err) {
      // 최신 모델 미사용 가능 시 4.1-mini로 폴백
      console.warn(
        `OpenAI primary model ${primaryModel} failed, falling back to ${fallbackModel}`,
        err instanceof Error ? err.message : err,
      );
      resp = await client.chat.completions.create({
        model: fallbackModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: q },
        ],
        temperature: 0.2,
        max_tokens: 400,
      });
    }
    const text = resp.choices[0]?.message?.content ?? "";
    if (!text) return null;
    const parsed = JSON.parse(text) as Partial<LlmIntent>;
    if (!parsed.kind) return null;
    const intent: LlmIntent = {
      kind: parsed.kind,
      params: { perPage: 6, ...(parsed.params ?? {}) },
      raw: q,
      labelHints: Array.isArray(parsed.labelHints) ? parsed.labelHints : [],
    };
    if (parsed.kind === "patent" && typeof parsed.appNo === "string") {
      intent.appNo = parsed.appNo;
    }
    // 안전 가드: 허용된 값만 통과
    if (intent.params.urgency && !["RED", "YELLOW", "GREEN", "ALL"].includes(intent.params.urgency)) {
      delete intent.params.urgency;
    }
    if (intent.params.org && !["UNIV", "GRI", "OTHER", "ALL"].includes(intent.params.org as string)) {
      delete intent.params.org;
    }
    if (
      intent.params.sort &&
      !["urgency", "recent", "citations", "claims", "transfers"].includes(intent.params.sort)
    ) {
      intent.params.sort = "urgency";
    }
    return intent;
  } catch (e) {
    console.error("openai intent error", e);
    return null;
  }
}

export async function llmIntent(q: string): Promise<LlmIntent | null> {
  return callOpenAi(q);
}
