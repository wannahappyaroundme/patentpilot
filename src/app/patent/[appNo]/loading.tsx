export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      <div className="space-y-3 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
