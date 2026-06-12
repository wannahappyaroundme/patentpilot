import { z } from "zod";

/**
 * 쓰기 API 입력 스키마 — 모든 사용자 입력은 여기서 길이·형식 검증 후에만
 * DB/LLM에 전달된다. 한도 변경 시 이 파일만 수정.
 */

const email = z
  .string()
  .trim()
  .max(254, "이메일이 너무 깁니다.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "이메일 형식이 올바르지 않습니다.");

const phone = z
  .string()
  .trim()
  .max(20, "전화번호가 너무 깁니다.")
  .regex(/^[0-9+\-() ]*$/, "전화번호 형식이 올바르지 않습니다.")
  .optional()
  .default("");

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label}은(는) ${max}자 이내로 입력해주세요.`)
    .optional()
    .default("");

const requiredText = (max: number, label: string) =>
  z
    .string({ error: `${label}은(는) 필수입니다.` })
    .trim()
    .min(1, `${label}은(는) 필수입니다.`)
    .max(max, `${label}은(는) ${max}자 이내로 입력해주세요.`);

export const loiSchema = z.object({
  website_alt: optionalText(200, "필드"), // honeypot — 라우트에서 별도 처리
  patent_application_number: optionalText(30, "출원번호"),
  company_name: requiredText(100, "기업명"),
  contact_name: requiredText(50, "담당자명"),
  contact_email: email,
  contact_phone: phone,
  proposed_amount: optionalText(50, "제안 금액"),
  message: optionalText(2000, "메시지"),
});

export const listSchema = z.object({
  website_alt: optionalText(200, "필드"), // honeypot
  patent_application_number: optionalText(30, "출원번호"),
  title: requiredText(300, "발명의 명칭"),
  applicant: optionalText(100, "출원인"),
  ipc_primary: optionalText(20, "IPC"),
  proposed_price: optionalText(50, "희망 가격"),
  org_name: requiredText(100, "기관명"),
  contact_name: requiredText(50, "담당자명"),
  contact_email: email,
  contact_phone: phone,
  message: optionalText(2000, "메시지"),
  patentrank_public: optionalText(10, "공개 여부"),
});

export const proposalSchema = z.object({
  appNo: z
    .string({ error: "appNo is required" })
    .trim()
    .min(1, "appNo is required")
    .max(20, "출원번호가 너무 깁니다.")
    .regex(/^[0-9-]+$/, "출원번호 형식이 올바르지 않습니다."),
  buyerCompanyName: optionalText(100, "기업명"),
  buyerIndustry: optionalText(50, "산업"),
  customNote: optionalText(1000, "운영자 메모"),
});

export const chatSchema = z.object({
  q: requiredText(500, "질문"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

/** safeParse 실패 시 사용자에게 보여줄 첫 번째 에러 메시지 */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? issue.message : "입력값이 올바르지 않습니다.";
}
