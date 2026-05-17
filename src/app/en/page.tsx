import Link from "next/link";

export const metadata = {
  title: "PatentPilot — Awakening Korea's sleeping R&D patents",
  description:
    "PatentPilot is a copilot that surfaces high-intent Korean R&D patents (universities, GRIs) and matches them with corporate buyers. Built on KIPRIS Plus data.",
  alternates: {
    canonical: "https://patentpilot.kr/en",
    languages: {
      ko: "https://patentpilot.kr/",
      en: "https://patentpilot.kr/en",
    },
  },
  openGraph: {
    title: "PatentPilot — Awakening Korea's sleeping R&D patents",
    description:
      "Discover 158,777 actively-maintained Korean R&D patents close to their 20-year expiration. Match TLOs and GRIs with corporate buyers.",
    url: "https://patentpilot.kr/en",
    locale: "en_US",
  },
};

export default function EnLandingPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="max-w-3xl">
        <div className="inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand">
          2026 KIPRIS Plus Data Startup Competition
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
          A copilot for Korea&apos;s
          <br />
          sleeping R&amp;D patents.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
          158,777 university &amp; GRI patents are approaching their 20-year
          expiration — and the renewal-fee clock is ticking. PatentPilot finds
          the ones with the strongest sell-side motivation and matches them
          with corporate buyers who actually need the technology.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href="/market"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            Browse listings
          </Link>
          <Link
            href="/en/about"
            className="rounded-md border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand hover:text-brand"
          >
            How it works
          </Link>
          <Link
            href="/"
            className="rounded-md border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand hover:text-brand"
          >
            한국어로 보기
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card
          num="01"
          title="Renewal-fee signal"
          body="Registration decision + active fee payment + zero transfer history. The exact moment a TLO is most willing to sell."
        />
        <Card
          num="02"
          title="Two-sided matching"
          body="Korean universities/GRIs ↔ enterprises. Recommends top-5 buyer candidates from IPC fit, R&D scale, and prior collaboration."
        />
        <Card
          num="03"
          title="KIPRIS-backed"
          body="Every listing links straight to the official KIPRIS page. Claims and bibliographic data are not rewritten or interpreted."
        />
      </section>

      <section className="rounded-2xl border border-ink-100 bg-ink-50/50 p-8">
        <h2 className="text-xl font-bold">By the numbers</h2>
        <ul className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
          <li>· <b>370,666</b> university &amp; GRI patents in pool</li>
          <li>· <b>158,777</b> actively maintained (renewal-fee paying)</li>
          <li>· 🔴 24,677 RED (apps 2006–2011, ≤5y left)</li>
          <li>· 🟡 57,933 YELLOW (apps 2012–2017, 6–11y left)</li>
          <li>· Universities: 105,562 · GRIs: 53,039</li>
          <li>· Source: KIPRIS Plus (Korea Institute of Patent Information)</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-8">
        <h2 className="text-xl font-bold">Get in touch</h2>
        <p className="mt-3 text-sm text-ink-700">
          For partnership, data licensing, TLO/GRI collaboration, enterprise
          deal flow, investor inquiries, or media interviews — please reach out.
        </p>
        <a
          href="mailto:ethos614@gmail.com?subject=PatentPilot%20Inquiry"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          📧 ethos614@gmail.com
        </a>
        <p className="mt-3 text-xs text-ink-500">
          We typically reply within 2 business days.
        </p>
      </section>

      <section className="border-t border-ink-100 pt-8 text-xs text-ink-400">
        <p>
          Note: The main product (search, AI copilot, deal-flow forms) is
          primarily Korean-language because the underlying KIPRIS data and the
          target users — Korean TLOs, GRIs, and enterprise R&amp;D teams —
          operate in Korean.
        </p>
      </section>
    </div>
  );
}

function Card({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="text-xs font-bold tracking-widest text-brand">{num}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
    </div>
  );
}
