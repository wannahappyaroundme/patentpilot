"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";

export function ListingForm() {
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
      const res = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "등록 실패");
      track("click", { target: "listing_submit", id: json.id });
      setSuccess(
        `매물 등록 신청이 정상 접수되었습니다. (#${json.id}) 영업일 2일 이내 회신드립니다.`,
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
          새 등록 작성
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-ink-500">매물 정보</h3>
        <Field
          label="특허 제목"
          name="title"
          required
          placeholder="예: 발열 저감 배터리 셀 어셈블리"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="출원번호" name="patent_application_number" placeholder="예: 10-2010-0012345 (선택)" />
          <Field label="주 IPC" name="ipc_primary" placeholder="예: H01M 10/0525 (선택)" />
        </div>
        <Field label="출원인/권리자" name="applicant" placeholder="예: 한국과학기술원 산학협력단" />
        <Field
          label="매도 의향가"
          name="proposed_price"
          placeholder="예: 3,000만원 협상가능 / 라이선스 + 일시불 협의"
        />
      </section>

      <section className="space-y-4 border-t border-ink-50 pt-5">
        <h3 className="text-sm font-semibold text-ink-500">담당자 정보</h3>
        <Field
          label="기관명 (TLO·산학협력단·연구원)"
          name="org_name"
          required
          placeholder="예: 한국과학기술원 산학협력단"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="담당자 이름" name="contact_name" required placeholder="예: 김지영" />
          <Field label="이메일" name="contact_email" type="email" required placeholder="tlo@kaist.ac.kr" />
        </div>
        <Field label="연락처" name="contact_phone" placeholder="010-1234-5678" />
      </section>

      <div className="border-t border-ink-50 pt-5">
        <Label>메시지</Label>
        <textarea
          name="message"
          rows={4}
          placeholder="현재 연차료 부담, 유사 매물 거래 이력, 사업화 검토 단계 등을 자유롭게 적어주세요."
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
        {submitting ? "등록 접수 중..." : "매물 등록 신청"}
      </button>
      <p className="text-center text-xs text-ink-300">
        제출 시 PatentPilot 운영팀이 검토 후 매수 후보 기업과 매칭을 시작합니다. 영업일 2일 이내 회신.
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
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
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
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
      />
    </div>
  );
}
