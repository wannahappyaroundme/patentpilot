import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { PageViewTracker } from "@/components/page-view-tracker";
import { SiteChrome } from "@/components/site-chrome";
import { ConsoleShield } from "@/components/console-shield";

export const metadata: Metadata = {
  metadataBase: new URL("https://patentpilot-livid.vercel.app"),
  title: {
    default: "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    template: "%s | PatentPilot",
  },
  description:
    "KIPRIS 기반 한국 대학·정출연이 보유한 R&D 특허 중 좋은 매물을 발굴해 기업과 매칭하는 특허 전문 코파일럿",
  keywords: [
    "PatentPilot",
    "패이턴트파일럿",
    "특허",
    "특허 매매",
    "특허 거래",
    "특허 매물",
    "기술이전",
    "R&D 특허",
    "한국 특허",
    "대학 특허",
    "정출연",
    "TLO",
    "산학협력단",
    "특허 매칭",
    "KIPRIS",
    "지식재산",
    "IP",
    "유지비",
    "연차료",
    "기술 매매",
    "특허 라이선싱",
    "특허 가치평가",
    "AI 코파일럿",
    "공공기술 사업화",
    "ETRI",
    "KAIST",
    "KIST",
    "특허 검색",
    "한국 R&D",
    "TreeO",
  ],
  authors: [{ name: "TreeO" }],
  creator: "TreeO",
  publisher: "PatentPilot",
  category: "technology",
  applicationName: "PatentPilot",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    description:
      "KIPRIS 기반 한국 대학·정출연이 보유한 R&D 특허 중 좋은 매물을 발굴해 기업과 매칭하는 특허 전문 코파일럿",
    url: "https://patentpilot-livid.vercel.app",
    siteName: "PatentPilot",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PatentPilot — 한국 R&D 특허 매칭 코파일럿",
    description:
      "KIPRIS 기반 한국 대학·정출연이 보유한 R&D 특허 중 좋은 매물을 발굴해 기업과 매칭하는 특허 전문 코파일럿",
  },
  alternates: {
    canonical: "https://patentpilot-livid.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PatentPilot",
    alternateName: "패이턴트파일럿",
    url: "https://patentpilot-livid.vercel.app",
    description:
      "KIPRIS 기반 한국 대학·정출연이 보유한 R&D 특허 중 좋은 매물을 발굴해 기업과 매칭하는 특허 전문 코파일럿",
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://patentpilot-livid.vercel.app/market?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "TreeO",
      logo: {
        "@type": "ImageObject",
        url: "https://patentpilot-livid.vercel.app/icon.svg",
      },
    },
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-ink-900 antialiased">
        <ConsoleShield />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
