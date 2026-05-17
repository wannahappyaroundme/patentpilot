// 클라이언트 폼 유효성 검사 + 포맷 유틸

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
const APPNO_RE = /^\d{2}-\d{4}-\d{6,7}$/;

export function validateEmail(v: string): string | null {
  if (!v) return "이메일을 입력해주세요.";
  if (!EMAIL_RE.test(v.trim())) return "이메일 형식이 올바르지 않습니다.";
  if (v.length > 200) return "이메일이 너무 깁니다.";
  return null;
}

export function validatePhone(v: string): string | null {
  if (!v) return null; // 선택 입력
  const cleaned = v.replace(/\s/g, "");
  if (!PHONE_RE.test(cleaned)) {
    return "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
  }
  return null;
}

export function validateAppNo(v: string): string | null {
  if (!v) return null; // 선택 입력
  if (!APPNO_RE.test(v.trim())) {
    return "출원번호 형식이 올바르지 않습니다. (예: 10-2008-0001234)";
  }
  return null;
}

export function validateRequired(
  v: string,
  label: string,
  opts: { min?: number; max?: number } = {},
): string | null {
  const trimmed = v.trim();
  if (!trimmed) return `${label}을(를) 입력해주세요.`;
  if (opts.min !== undefined && trimmed.length < opts.min) {
    return `${label}은(는) 최소 ${opts.min}자 이상이어야 합니다.`;
  }
  if (opts.max !== undefined && trimmed.length > opts.max) {
    return `${label}은(는) 최대 ${opts.max}자까지 입력 가능합니다.`;
  }
  return null;
}

/**
 * 입력 문자열에서 4자리 이상 연속된 숫자 그룹을 자동으로 1,000 단위 콤마 포맷.
 * 한글 단위가 섞여도 OK. 예: "5000만원" → "5,000만원", "10000000원" → "10,000,000원".
 * 이미 콤마가 있는 경우 (5,000) 그대로 두고 재포맷.
 */
export function formatAmountInput(raw: string): string {
  // 기존 콤마는 일단 제거하고 다시 포맷
  const cleaned = raw.replace(/(\d),(?=\d{3}\b)/g, "$1");
  return cleaned.replace(/\d{4,}/g, (m) => {
    return Number(m).toLocaleString("ko-KR");
  });
}
