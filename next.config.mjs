import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */

// CSP는 Next.js inline script 호환 작업이 커서 후속 라운드 (스펙 §범위 제외 참조)
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  experimental: {
    instrumentationHook: true, // Next 14에서 src/instrumentation.ts 활성화
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // SENTRY_AUTH_TOKEN 없으면 소스맵 업로드는 자동 생략됨 (빌드 실패 아님)
  telemetry: false,
});
