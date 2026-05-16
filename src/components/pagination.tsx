import Link from "next/link";

interface Props {
  page: number;
  perPage: number;
  total: number;
  buildHref: (p: number) => string;
}

export function Pagination({ page, perPage, total, buildHref }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="페이지네이션">
      <PageLink href={buildHref(Math.max(1, page - 1))} disabled={page === 1}>
        이전
      </PageLink>
      {start > 1 && (
        <>
          <PageLink href={buildHref(1)} active={false}>
            1
          </PageLink>
          {start > 2 && <span className="px-1 text-ink-300">…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageLink key={p} href={buildHref(p)} active={p === page}>
          {p}
        </PageLink>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-300">…</span>}
          <PageLink href={buildHref(totalPages)}>{totalPages}</PageLink>
        </>
      )}
      <PageLink
        href={buildHref(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        다음
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border border-ink-100 px-3 py-1.5 text-sm text-ink-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-ink-100 text-ink-700 hover:bg-ink-50"
      }`}
    >
      {children}
    </Link>
  );
}
