export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-4 w-32 rounded bg-[var(--bg-recessed)]" />
        <div className="h-10 w-1/2 rounded-xl bg-[var(--bg-recessed)]" />
        <div className="h-4 w-1/3 rounded bg-[var(--bg-recessed)]" />
      </div>

      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
        {/* Main Card Skeleton */}
        <div className="industrial-card p-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-[var(--border-recessed)]">
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-[var(--bg-recessed)]" />
              <div className="h-3 w-48 rounded bg-[var(--bg-recessed)]" />
            </div>
            <div className="h-8 w-24 rounded-full bg-[var(--bg-recessed)]" />
          </div>

          <div className="space-y-3">
            <div className="h-12 w-full rounded-xl bg-[var(--bg-recessed)]" />
            <div className="h-12 w-full rounded-xl bg-[var(--bg-recessed)]" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="industrial-recessed p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-[var(--bg-chassis)]" />
          <div className="h-10 w-full rounded-lg bg-[var(--bg-chassis)]" />
          <div className="h-10 w-full rounded-lg bg-[var(--bg-chassis)]" />
        </div>
      </div>
    </div>
  );
}
