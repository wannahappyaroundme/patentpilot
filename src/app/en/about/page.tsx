import Link from "next/link";

export const metadata = {
  title: "About — PatentPilot",
  description:
    "How PatentPilot identifies high-intent Korean R&D patents, matches them with corporate buyers, and earns matching fees on closed deals.",
  alternates: {
    canonical: "https://patentpilot.kr/en/about",
    languages: {
      ko: "https://patentpilot.kr/about",
      en: "https://patentpilot.kr/en/about",
    },
  },
};

export default function EnAboutPage() {
  return (
    <article className="mx-auto max-w-3xl py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          About PatentPilot
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          How PatentPilot works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Korea&apos;s universities and government-funded research institutes
          (GRIs) hold more than 370,000 R&amp;D patents. A large share will
          expire within the next decade — and renewal fees climb steeply after
          year 10. PatentPilot turns that pressure into a market signal.
        </p>
      </header>

      <Section title="1. The renewal-fee signal">
        <p>
          A Korean patent runs for 20 years from filing. Renewal fees more than
          double after year 10 and again at year 16. TLOs paying these fees on
          a non-commercialized patent are signaling intent to sell &mdash; and
          in our measured pool, more than half of all active listings have
          already crossed that year-10 fee jump.
        </p>
        <p>
          PatentPilot filters the KIPRIS pool to patents that satisfy three
          conditions: (1) a registration decision was issued, (2) renewal fees
          are still being paid, and (3) no prior transfer events exist. That
          intersection is the addressable seller pool — 104,582 patents today (measured 2026-06-07).
        </p>
      </Section>

      <Section title="2. Urgency tiers">
        <ul>
          <li>
            <b>🔴 RED</b> — apps filed 2006–2011. ≤5 years until expiration.
            Highest sell motivation. 19,723 patents (18.9%).
          </li>
          <li>
            <b>🟡 YELLOW</b> — apps filed 2012–2017. 6–11 years left. The
            largest tier and the core of our addressable market: motivation is
            building fast. 52,554 patents (50.2%).
          </li>
          <li>
            <b>🟢 GREEN</b> — apps filed 2018+. 12+ years left. Lower urgency
            but earlier price discovery. 32,305 patents (30.9%).
          </li>
        </ul>
      </Section>

      <Section title="3. Two-sided matching">
        <p>
          On the buyer side, PatentPilot recommends up to 5 corporate
          candidates per listing, ranked on three weighted dimensions:
        </p>
        <ul>
          <li>
            <b>IPC fit</b> — overlap between the patent&apos;s primary IPC and
            the candidate&apos;s recent filing footprint.
          </li>
          <li>
            <b>R&amp;D scale</b> — corporate revenue band and R&amp;D
            intensity proxy.
          </li>
          <li>
            <b>Collaboration history</b> — prior joint applications or
            transfers with the same TLO or institute.
          </li>
        </ul>
      </Section>

      <Section title="4. Business model">
        <p>
          PatentPilot is free for both sides during the discovery phase.
          Matching fees (5–10% of deal value, split between buyer and seller)
          are charged only when a deal closes. Submitting a buy-intent (LOI)
          or a listing carries no obligation.
        </p>
      </Section>

      <Section title="5. Data &amp; methodology">
        <p>
          Source data: KIPRIS Plus, operated by the Korea Institute of Patent
          Information. PatentPilot does not rewrite claims or bibliographic
          fields. Every listing links to the official KIPRIS detail page so
          users can verify upstream.
        </p>
      </Section>

      <Section title="6. Why Korean-first?">
        <p>
          The product UI is primarily Korean because the underlying data,
          target buyers (Korean enterprise R&amp;D teams), and sellers (Korean
          TLOs and GRIs) all operate in Korean. This English page exists for
          investors, international partners, and competition reviewers.
        </p>
      </Section>

      <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
        <h3 className="text-base font-bold text-ink-900">
          Partnerships &amp; data inquiries
        </h3>
        <p className="mt-2 text-sm text-ink-700">
          For partnership, data licensing, TLO/GRI collaboration, enterprise
          deal flow, investor inquiries, or media interviews — please reach
          out.
        </p>
        <a
          href="mailto:ethos614@gmail.com?subject=PatentPilot%20Inquiry"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          📧 ethos614@gmail.com
        </a>
      </div>

      <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-6 text-sm">
        <Link
          href="/en"
          className="text-ink-500 hover:text-brand"
        >
          ← English home
        </Link>
        <span className="text-ink-300">·</span>
        <Link
          href="/about"
          className="text-ink-500 hover:text-brand"
        >
          한국어 소개 페이지
        </Link>
        <span className="text-ink-300">·</span>
        <Link href="/market" className="text-brand hover:underline">
          Browse listings →
        </Link>
      </footer>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 space-y-3 text-sm leading-relaxed text-ink-700">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
