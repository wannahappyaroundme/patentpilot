import { BannerSlider } from "@/components/banner-slider";
import { LiveCounter } from "@/components/live-counter";
import { QuickMenu } from "@/components/quick-menu";
import { RotatingText } from "@/components/rotating-text";
import { SearchBar } from "@/components/search-bar";
import { ThemeCards } from "@/components/theme-cards";
import { TopOrgs } from "@/components/top-orgs";

export default async function HomePage() {
  return (
    <div className="space-y-14 py-8 sm:space-y-16 sm:py-12">
      <section className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RotatingText />
          <SearchBar />
        </div>
        <QuickMenu />
      </section>

      <BannerSlider />

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">지금 시장</h2>
          <span className="text-xs text-ink-300">5분 캐시 · 매물 풀 기준</span>
        </div>
        <LiveCounter />
      </section>

      <ThemeCards />

      <TopOrgs />
    </div>
  );
}
