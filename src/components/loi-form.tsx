"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  validateEmail,
  validatePhone,
  validateAppNo,
  validateRequired,
  formatAmountInput,
} from "@/lib/form";

interface Props {
  defaultAppNo?: string;
}

interface FormValues {
  patent_application_number: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  proposed_amount: string;
  message: string;
}

const INITIAL: FormValues = {
  patent_application_number: "",
  company_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  proposed_amount: "",
  message: "",
};

export function LoiForm({ defaultAppNo }: Props) {
  const [values, setValues] = useState<FormValues>({
    ...INITIAL,
    patent_application_number: defaultAppNo ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function setField(name: keyof FormValues, raw: string) {
    const v = name === "proposed_amount" ? formatAmountInput(raw) : raw;
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  }

  function validateAll(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};
    const e1 = validateRequired(values.company_name, "회사명", { max: 100 });
    if (e1) next.company_name = e1;
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
    setSubmitting(true);
    setServerError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/loi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "신청 실패");
      track("loi_submit", {
        application_id: json.id,
        appNo: values.patent_application_number,
        company_name: values.company_name,
      });
      setSuccess(
        `거래 신청이 정상 접수되었습니다. (#${json.id}) 영업일 2일 이내 회신드립니다.`,
      );
      setValues({ ...INITIAL });
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
          새 신청 작성
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
      <Field
        label="특허 출원번호"
        name="patent_application_number"
        value={values.patent_application_number}
        onChange={setField}
        placeholder="예: 10-2008-0000081 (선택, 매물 페이지에서 자동 채움)"
        error={errors.patent_application_number}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="회사명"
          name="company_name"
          required
          value={values.company_name}
          onChange={setField}
          placeholder="예: 삼성전자 주식회사"
          error={errors.company_name}
        />
        <Field
          label="담당자 이름"
          name="contact_name"
          required
          value={values.contact_name}
          onChange={setField}
          placeholder="예: 박상훈"
          error={errors.contact_name}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="이메일"
          name="contact_email"
          type="email"
          required
          value={values.contact_email}
          onChange={setField}
          placeholder="contact@company.com"
          error={errors.contact_email}
        />
        <Field
          label="연락처"
          name="contact_phone"
          value={values.contact_phone}
          onChange={setField}
          placeholder="010-1234-5678"
          error={errors.contact_phone}
        />
      </div>

      <Field
        label="제안 금액 (자유 텍스트, 숫자는 자동으로 1,000 단위 콤마)"
        name="proposed_amount"
        value={values.proposed_amount}
        onChange={setField}
        placeholder="예: 5,000만원 협상 가능 / 라이선스 + 일시불 협의"
        error={errors.proposed_amount}
      />

      <div>
        <Label>메시지</Label>
        <textarea
          name="message"
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="해당 기술의 활용 계획, 라이선스 vs 양도 등 협상 조건을 자유롭게 적어주세요."
          className="mt-1.5 block w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
        />
        <div className="mt-1 text-right text-xs text-ink-300">
          {values.message.length} / 2000
        </div>
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
