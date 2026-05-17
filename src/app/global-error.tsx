"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. Replaces the root layout (so includes html/body).
 * Triggered when a Server Component or layout throws.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 콘솔에만 기록 — 외부 Sentry 같은 곳으로 보낼 거면 여기서 호출
    // eslint-disable-next-line no-console
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif',
          background: "#F8FAFC",
          color: "#0B1220",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <section
          style={{
            maxWidth: 560,
            width: "100%",
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 20px",
              background: "#006EFF",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 26,
            }}
            aria-hidden="true"
          >
            ✈
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#DC2626",
              margin: 0,
            }}
          >
            500 · UNEXPECTED ERROR
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "12px 0 8px",
            }}
          >
            앗, 비행기가 잠깐 흔들렸어요.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#64748B",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            예상하지 못한 오류가 발생했습니다. 새로고침으로 보통 해결되며,
            계속 발생하면{" "}
            <a
              href="mailto:ethos614@gmail.com?subject=PatentPilot%20500%20error"
              style={{ color: "#006EFF", textDecoration: "none" }}
            >
              ethos614@gmail.com
            </a>
            으로 알려주시면 빠르게 확인하겠습니다.
          </p>
          {error?.digest && (
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                fontFamily: "monospace",
                margin: "0 0 24px",
              }}
            >
              error id: {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#006EFF",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                background: "white",
                color: "#475569",
                border: "1px solid #CBD5E1",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              홈으로
            </a>
          </div>
        </section>
      </body>
    </html>
  );
}
