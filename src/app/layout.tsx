import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
  description:
    "한국 대학·정출연이 보유한 R&D 특허 7.8만건 중, 곧 유지비를 포기할 매물을 발굴해 기업과 매칭합니다.",
  openGraph: {
    title: "PatentPilot",
    description: "잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-background text-ink-900 antialiased">
        <Header />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
