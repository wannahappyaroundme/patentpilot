import * as Sentry from "@sentry/nextjs";

// DSN 미설정이면 no-op — 로컬 dev·CI에 영향 없음
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
