import Link from "next/link";
import { ThemeCards } from "@/components/theme-cards";

export const metadata = {
  title: "기술분야로 매물 찾기 — PatentPilot",
};

export default function ThemesPage() {
  return (
    <div className="space-y-8 py-12">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">기술분야로 매물 찾기</h1>
        <p className="mt-2 text-sm text-ink-500">
          IPC 분류 기준 — 매물 풀 158,777건을 기술 카테고리로 묶어 봅니다.
        </p>
      </div>
      <ThemeCards />
      <div className="text-center">
        <Link href="/market" className="text-sm font-medium text-brand hover:underline">
          전체 매물 보기 →
        </Link>
      </div>
    </div>
  );
}
