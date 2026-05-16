"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface Props {
  defaultAppNo?: string;
}

export function LoiForm({ defaultAppNo }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/loi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "신청 실패");
      setSuccess(
        `거래 신청이 정상 접수되었습니다. (#${json.id}) 영업일 2일 이내 회신드립니다.`,
      );
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
        <p className="mt-3 text-base font-semibold text-emerald-800">{success}</p>
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          새 신청 작성
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
      <Field
        label="특허 출원번호"
        name="patent_application_number"
        defaultValue={defaultAppNo}
        placeholder="예: 10-2008-0000081 (선택, 매물 페이지에서 자동 채움)"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="회사명" name="company_name" required placeholder="예: 삼성전자 주식회사" />
        <Field label="담당자 이름" name="contact_name" required placeholder="예: 박상훈" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="이메일"
          name="contact_email"
          type="email"
          required
          placeholder="contact@company.com"
        />
        <Field
          label="연락처"
          name="contact_phone"
          placeholder="010-1234-5678"
        />
      </div>

      <Field
        label="제안 금액 (자유 텍스트)"
        name="proposed_amount"
        placeholder="예: 5,000만원 협상 가능 / 라이선스 + 일시불 협의"
      />

      <div>
        <Label>메시지</Label>
        <textarea
          name="message"
          rows={5}
          placeholder="해당 기술의 활용 계획, 라이선스 vs 양도 등 협상 조건을 자유롭게 적어주세요."
          className="mt-1.5 block w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {submitting ? "신청 접수 중..." : "거래 신청 보내기"}
      </button>
      <p className="text-center text-xs text-ink-300">
        제출 시 PatentPilot 운영팀이 매도 기관에 컨택을 시작합니다. 영업일 2일 이내 회신.
      </p>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-ink-700">{children}</label>;
}

function Field({
  label,
  name,
  required,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
      />
    </div>
  );
}
