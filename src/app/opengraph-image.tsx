import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #001E47 0%, #0049A8 45%, #006EFF 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <rect width="40" height="40" rx="10" fill="#006EFF" />
              <path
                d="M11 13L29 9L21 30L18.5 22.5L11 13Z"
                fill="white"
              />
              <circle cx="32" cy="30" r="2.2" fill="#00E4DF" />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
            PatentPilot
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#A8CDFF",
              letterSpacing: -0.5,
            }}
          >
            잠자는 한국 R&D 특허, 깨어날 시간입니다
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            대학·정출연 특허 158,777건
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#D5E7FF",
              marginTop: 8,
              letterSpacing: -0.5,
            }}
          >
            유지비 부담 매물을 기업과 매칭하는 AI 코파일럿
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#A8CDFF",
          }}
        >
          <div>2026 지식재산 데이터 활용 창업 경진대회</div>
          <div style={{ fontWeight: 700, color: "white" }}>
            patentpilot.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
