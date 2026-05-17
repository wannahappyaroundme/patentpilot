"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  validateEmail,
  validatePhone,
  validateAppNo,
  validateRequired,
  formatAmountInput,
} from "@/lib/form";

interface FormValues {
  patent_application_number: string;
  title: string;
  applicant: string;
  ipc_primary: string;
  proposed_price: string;
  org_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  message: string;
}

const INITIAL: FormValues = {
  patent_application_number: "",
  title: "",
  applicant: "",
  ipc_primary: "",
  proposed_price: "",
  org_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  message: "",
};

export function ListingForm() {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  function setField(name: keyof FormValues, raw: string) {
    const v = name === "proposed_price" ? formatAmountInput(raw) : raw;
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  }

  function validateAll(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};
    const e0 = validateRequired(values.title, "특허 제목", { max: 300 });
    if (e0) next.title = e0;
    const e1 = validateRequired(values.org_name, "기관명", { max: 100 });
    if (e1) next.org_name = e1;
    const e2 = validateRequired(values.contact_name, "담당자 이름", { max: 50 });
    if (e2) next.contact_name = e2;
    const e3 = validateEmail(values.contact_email);
    if (e3) next.contact_email = e3;
    const e4 = validatePhone(values.contact_phone);
    if (e4) next.contact_phone = e4;
    const e5 = validateAppNo(values.patent_application_number);
    if (e5) next.patent_application_number = e5;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateAll()) return;
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitting(true);
    setServerError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "등록 실패");
      track("click", { target: "listing_submit", id: json.id });
      setSuccess(
        `매물 등록 신청이 정상 접수되었습니다. (#${json.id}) 영업일 2일 이내 회신드립니다.`,
      );
      setValues(INITIAL);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "알 수 없는 오류");
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
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-ink-500">매물 정보</h3>
        <Field
          label="특허 제목"
          name="title"
          required
          value={values.title}
          onChange={setField}
          placeholder="예: 발열 저감 배터리 셀 어셈블리"
          error={errors.title}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="출원번호"
            name="patent_application_number"
            value={values.patent_application_number}
            onChange={setField}
            placeholder="예: 10-2010-0012345 (선택)"
            error={errors.patent_application_number}
          />
          <Field
            label="주 IPC"
            name="ipc_primary"
            value={values.ipc_primary}
            onChange={setField}
            placeholder="예: H01M 10/0525 (선택)"
          />
        </div>
        <Field
          label="출원인/권리자"
          name="applicant"
          value={values.applicant}
          onChange={setField}
          placeholder="예: 한국과학기술원 산학협력단"
        />
        <Field
          label="매도 의향가 (숫자는 자동으로 1,000 단위 콤마)"
          name="proposed_price"
          value={values.proposed_price}
          onChange={setField}
          placeholder="예: 3,000만원 협상가능 / 라이선스 + 일시불 협의"
        />
      </section>

      <section className="space-y-4 border-t border-ink-50 pt-5">
        <h3 className="text-sm font-semibold text-ink-500">담당자 정보</h3>
        <Field
          label="기관명 (TLO·산학협력단·연구원)"
          name="org_name"
          required
          value={values.org_name}
          onChange={setField}
          placeholder="예: 한국과학기술원 산학협력단"
          error={errors.org_name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="담당자 이름"
            name="contact_name"
            required
            value={values.contact_name}
            onChange={setField}
            placeholder="예: 김지영"
            error={errors.contact_name}
          />
          <Field
            label="이메일"
            name="contact_email"
            type="email"
            required
            value={values.contact_email}
            onChange={setField}
            placeholder="tlo@kaist.ac.kr"
            error={errors.contact_email}
          />
        </div>
        <Field
          label="연락처"
          name="contact_phone"
          value={values.contact_phone}
          onChange={setField}
          placeholder="010-1234-5678"
          error={errors.contact_phone}
        />
      </section>

      <div className="border-t border-ink-50 pt-5">
        <Label>메시지</Label>
        <textarea
          name="message"
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="현재 연차료 부담, 유사 매물 거래 이력, 사업화 검토 단계 등을 자유롭게 적어주세요."
          className="mt-1.5 block w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
        />
        <div className="mt-1 text-right text-xs text-ink-300">
          {values.message.length} / 2000
        </div>
      </div>

      <div
        className={`flex items-start gap-2 rounded-md border p-3 text-xs ${
          consentError
            ? "border-red-300 bg-red-50 text-red-700"
            : "border-ink-100 bg-ink-50 text-ink-600"
        }`}
      >
        <input
          id="listing-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentError(false);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand"
        />
        <label htmlFor="listing-consent" className="cursor-pointer leading-relaxed">
          (필수){" "}
          <Link href="/privacy" target="_blank" className="text-brand hover:underline">
            개인정보처리방침
          </Link>{" "}
          및{" "}
          <Link href="/terms" target="_blank" className="text-brand hover:underline">
            이용약관
          </Link>
          에 동의하며, 매물 정보 및 담당자 연락처를 운영자가 매수 후보 기업에
          공유함에 동의합니다.
        </label>
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
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

interface FieldProps {
  label: string;
  name: keyof FormValues;
  value: string;
  onChange: (name: keyof FormValues, v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  error?: string;
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  error,
}: FieldProps) {
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
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`mt-1.5 block w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:outline-none ${
          error ? "border-red-300 focus:border-red-500" : "border-ink-100 focus:border-brand"
        }`}
      />
      {error && (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}
