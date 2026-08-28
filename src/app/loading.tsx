export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-xl mx-auto mb-12 space-y-4">
        <div className="h-4 w-32 mx-auto rounded-full bg-[var(--bg-recessed)]" />
        <div className="h-10 w-3/4 mx-auto rounded-xl bg-[var(--bg-recessed)]" />
        <div className="h-4 w-1/2 mx-auto rounded bg-[var(--bg-recessed)]" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="industrial-card p-6 h-64 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-[var(--bg-recessed)]" />
              <div className="h-6 w-3/4 rounded bg-[var(--bg-recessed)]" />
              <div className="h-3 w-full rounded bg-[var(--bg-recessed)]" />
              <div className="h-3 w-4/5 rounded bg-[var(--bg-recessed)]" />
            </div>
            <div className="h-8 w-full rounded-lg bg-[var(--bg-recessed)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
