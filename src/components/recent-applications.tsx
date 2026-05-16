import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

interface Row {
  id: number;
  company_name: string;
  patent_application_number: string | null;
  created_at: string;
}

function maskCompany(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "익명 기업";
  // 첫 글자 + ** 형태로 마스킹 (예: 삼성전자 → 삼**)
  const head = trimmed.slice(0, 1);
  return `${head}**`;
}

function relative(when: string): string {
  const t = new Date(when).getTime();
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

async function fetchRecent(): Promise<Row[]> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("applications")
      .select("id, company_name, patent_application_number, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error || !data) return [];
    return data as Row[];
  } catch {
    return [];
  }
}

export async function RecentApplications() {
  const rows = await fetchRecent();
  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold">실시간 거래 신청</h2>
          <p className="mt-1 text-xs text-ink-500">
            최근 5건 (개인정보 보호를 위해 기업명은 익명화 처리)
          </p>
        </div>
        <Link
          href="/apply"
          className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand-100"
        >
          + 신청 작성
        </Link>
      </div>
      <ul className="divide-y divide-ink-50">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 py-3 text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand">
              {maskCompany(r.company_name).slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-ink-900">
                <b className="font-semibold">{maskCompany(r.company_name)}</b>
                <span className="text-ink-500"> 기업이 매물 거래를 신청했습니다</span>
              </div>
              <div className="mt-0.5 text-xs text-ink-500">
                {r.patent_application_number ? (
                  <Link
                    href={`/patent/${encodeURIComponent(r.patent_application_number)}`}
                    className="font-mono text-brand hover:underline"
                  >
                    {r.patent_application_number}
                  </Link>
                ) : (
                  "전체 컨설팅 요청"
                )}
              </div>
            </div>
            <span className="shrink-0 text-xs text-ink-300">{relative(r.created_at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
