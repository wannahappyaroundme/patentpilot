import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import { AdminDeleteButton } from "@/components/admin-delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "거래 신청 관리 — PatentPilot Admin",
  robots: { index: false, follow: false },
};

interface Row {
  id: number;
  patent_application_number: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  proposed_amount: string;
  message: string;
  created_at: string;
}

async function fetchApplications(): Promise<{ rows: Row[]; error?: string }> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []) as Row[] };
  } catch (e) {
    return {
      rows: [],
      error: e instanceof Error ? e.message : "service client init error",
    };
  }
}

export default async function AdminApplicationsPage() {
  const { rows, error } = await fetchApplications();

  return (
    <div className="py-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Admin
          </div>
          <h1 className="text-2xl font-bold">거래 신청 (LOI)</h1>
          <p className="mt-1 text-sm text-ink-500">
            매수 기업이 보낸 거래 의향서 · 최신순 200건
          </p>
        </div>
        <div className="text-sm tabular-nums text-ink-500">
          총 <b className="text-ink-900">{rows.length}</b>건
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
          <div className="text-base font-semibold">아직 신청 없음</div>
          <p className="mt-2 text-sm text-ink-500">
            거래 신청이 들어오면 이 페이지에 노출됩니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">접수일</th>
                <th className="px-4 py-3">회사 / 담당자</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">대상 매물</th>
                <th className="px-4 py-3">제안 금액</th>
                <th className="px-4 py-3">메시지</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {rows.map((r) => (
                <tr key={r.id} className="align-top hover:bg-ink-50/30">
                  <td className="px-4 py-3 tabular-nums text-ink-300">#{r.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                    {new Date(r.created_at).toLocaleString("ko-KR", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink-900">
                      {r.company_name}
                    </div>
                    <div className="text-xs text-ink-500">{r.contact_name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${r.contact_email}`}
                      className="text-brand hover:underline"
                    >
                      {r.contact_email}
                    </a>
                    {r.contact_phone && (
                      <div className="text-xs text-ink-500">{r.contact_phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.patent_application_number ? (
                      <Link
                        href={`/patent/${encodeURIComponent(r.patent_application_number)}`}
                        className="font-mono text-brand hover:underline"
                      >
                        {r.patent_application_number}
                      </Link>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-900">
                    {r.proposed_amount || <span className="text-ink-300">—</span>}
                  </td>
                  <td className="max-w-md px-4 py-3 text-ink-700">
                    <div className="line-clamp-3 whitespace-pre-wrap break-words">
                      {r.message || (
                        <span className="text-ink-300">(메시지 없음)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminDeleteButton
                      endpoint={`/api/admin/applications/${r.id}`}
                      confirmText={`거래 신청 #${r.id} (${r.company_name})을(를) 삭제하시겠어요?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
