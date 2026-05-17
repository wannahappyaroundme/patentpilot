import { ImageResponse } from "next/og";
import { getPatentByAppNo } from "@/lib/patents";

export const runtime = "nodejs";
export const alt = "PatentPilot 매물 카드";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const URGENCY_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  RED: { label: "🔴 긴급", bg: "#FEE2E2", fg: "#B91C1C" },
  YELLOW: { label: "🟡 임박", bg: "#FEF3C7", fg: "#92400E" },
  GREEN: { label: "🟢 일반", bg: "#D1FAE5", fg: "#065F46" },
};

export default async function PatentOgImage({
  params,
}: {
  params: { appNo: string };
}) {
  const appNo = decodeURIComponent(params.appNo);
  const p = await getPatentByAppNo(appNo);

  // Fallback: 매물 없을 때 기본 카드
  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#006EFF",
            color: "white",
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          PatentPilot
        </div>
      ),
      size,
    );
  }

  const u = URGENCY_LABEL[p.urgency] ?? URGENCY_LABEL.GREEN!;
  const title = (p.title || "").slice(0, 80);
  const orgName = p.university_name || p.applicant || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "white",
          padding: "60px 72px",
          fontFamily:
            'Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {/* Header: logo + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#006EFF",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            ✈
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 800 }}>
            <span style={{ color: "#0B1220" }}>Patent</span>
            <span style={{ color: "#006EFF" }}>Pilot</span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              padding: "8px 16px",
              background: u.bg,
              color: u.fg,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 999,
              display: "flex",
            }}
          >
            {u.label}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 40,
            fontSize: 56,
            fontWeight: 800,
            color: "#0B1220",
            lineHeight: 1.2,
            display: "flex",
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        {/* Org name */}
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 600,
            color: "#475569",
            display: "flex",
          }}
        >
          {orgName}
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            fontSize: 22,
            color: "#0B1220",
          }}
        >
          <Stat label="출원번호" value={p.application_number} />
          <Stat label="주 IPC" value={p.ipc_primary || "-"} />
          <Stat label="청구항" value={`${p.claims_count ?? 0}개`} />
          <Stat label="피인용" value={`${p.citation_count ?? 0}`} />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 36,
            paddingTop: 24,
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#64748B",
          }}
        >
          <span>잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿</span>
          <span>patentpilot.kr</span>
        </div>
      </div>
    ),
    size,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 16, color: "#94A3B8", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 24, color: "#0B1220", fontWeight: 700 }}>
        {value}
      </span>
    </div>
  );
}
