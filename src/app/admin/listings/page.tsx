import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "매물 등록 관리 — PatentPilot Admin",
  robots: { index: false, follow: false },
};

interface Row {
  id: number;
  patent_application_number: string | null;
  title: string;
  applicant: string;
  ipc_primary: string;
  proposed_price: string;
  org_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  message: string;
  status: string;
  created_at: string;
}

async function fetchListings(): Promise<{ rows: Row[]; error?: string }> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("listings")
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

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  reviewing: "bg-brand-50 text-brand",
  listed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function AdminListingsPage() {
  const { rows, error } = await fetchListings();
  return (
    <div className="py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Admin</div>
          <h1 className="text-2xl font-bold">매물 등록 신청</h1>
          <p className="mt-1 text-sm text-ink-500">매도자(TLO·정출연)가 보낸 매물 등록 신청 · 최신 200건</p>
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
          <div className="text-base font-semibold">아직 등록 신청 없음</div>
          <p className="mt-2 text-sm text-ink-500">매도자가 매물을 등록하면 이 페이지에 노출됩니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">접수</th>
                <th className="px-4 py-3">기관 / 담당자</th>
                <th className="px-4 py-3">매물 제목</th>
                <th className="px-4 py-3">IPC</th>
                <th className="px-4 py-3">의향가</th>
                <th className="px-4 py-3">출원번호</th>
                <th className="px-4 py-3">상태</th>
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
                    <div className="font-semibold text-ink-900">{r.org_name}</div>
                    <div className="text-xs text-ink-500">{r.contact_name}</div>
                    <a href={`mailto:${r.contact_email}`} className="text-xs text-brand hover:underline">
                      {r.contact_email}
                    </a>
                  </td>
                  <td className="max-w-sm px-4 py-3 text-ink-900">
                    <div className="line-clamp-2 font-medium">{r.title}</div>
                    {r.message && (
                      <div className="mt-1 line-clamp-2 text-xs text-ink-500">{r.message}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{r.ipc_primary || "—"}</td>
                  <td className="px-4 py-3 text-ink-900">{r.proposed_price || "—"}</td>
                  <td className="px-4 py-3">
                    {r.patent_application_number ? (
                      <Link
                        href={`/patent/${encodeURIComponent(r.patent_application_number)}`}
                        className="font-mono text-xs text-brand hover:underline"
                      >
                        {r.patent_application_number}
                      </Link>
                    ) : (
                      <span className="text-ink-300">신규</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[r.status] ?? "bg-ink-50 text-ink-700"
                      }`}
                    >
                      {r.status}
                    </span>
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
