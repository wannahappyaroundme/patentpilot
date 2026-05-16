import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

interface Suggestion {
  label: string;
  hint: string;
  href: string;
}

const IPC_PRESETS: Array<{ kw: RegExp; label: string; ipc: string }> = [
  { kw: /배터리|리튬|2차전지|이차전지/, label: "배터리·2차전지", ipc: "H01M,B60L" },
  { kw: /반도체|메모리|DRAM|NAND|파운드리/, label: "반도체·메모리", ipc: "H01L,G11C" },
  { kw: /바이오|제약|항체|백신|단백질|세포/, label: "바이오·신약", ipc: "A61K,C07K,C12N" },
  { kw: /디스플레이|OLED|LCD/, label: "디스플레이", ipc: "G09G,G02F" },
  { kw: /태양광|수소|연료전지|풍력|신재생/, label: "에너지·신재생", ipc: "F03D,H02J,H01M" },
  { kw: /자동차|차량|모빌리티|EV|전기차/, label: "모빌리티", ipc: "B60K,B60W,B62D" },
  { kw: /5G|통신|네트워크|무선/, label: "통신·미디어", ipc: "H04W,H04L" },
  { kw: /AI|인공지능|머신러닝|딥러닝/, label: "AI·소프트웨어", ipc: "G06N,G06F" },
  { kw: /조선|선박|LNG/, label: "조선·해양", ipc: "B63B,F17C" },
  { kw: /항공|드론|방산/, label: "항공·방산", ipc: "B64C,F02C,F41H" },
];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q || q.length < 1) return NextResponse.json({ suggestions: [] });

  const out: Suggestion[] = [];

  // IPC 카테고리 매칭
  for (const p of IPC_PRESETS) {
    if (p.kw.test(q)) {
      out.push({
        label: p.label,
        hint: `IPC ${p.ipc} 매물 보기`,
        href: `/market?ipc=${encodeURIComponent(p.ipc)}`,
      });
    }
  }

  // 기관명 매칭 (Supabase ilike)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey && q.length >= 2) {
    try {
      const sb = createClient(url, anonKey, {
        auth: { persistSession: false },
      });
      const { data } = await sb
        .from("patents")
        .select("university_name")
        .ilike("university_name", `%${q}%`)
        .neq("university_name", "")
        .limit(50);
      const counts = new Map<string, number>();
      for (const row of (data ?? []) as Array<{ university_name: string }>) {
        const n = row.university_name;
        if (!n) continue;
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }
      const top = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      for (const [name] of top) {
        out.push({
          label: name,
          hint: "이 기관 매물 보기",
          href: `/market?university=${encodeURIComponent(name)}`,
        });
      }
    } catch {
      // ignore
    }
  }

  // Fallback: 키워드 검색
  out.push({
    label: `"${q}" 전체 검색`,
    hint: "제목/출원인/기관명 통합 검색",
    href: `/market?q=${encodeURIComponent(q)}`,
  });

  return NextResponse.json({ suggestions: out.slice(0, 8) });
}
