export default function TechHubLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-10 space-y-4">
        <div className="h-4 w-40 rounded bg-[var(--bg-recessed)]" />
        <div className="h-10 w-2/3 rounded-xl bg-[var(--bg-recessed)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--bg-recessed)]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-3 p-2 bg-[var(--bg-recessed)] rounded-xl mb-8">
        <div className="h-11 flex-1 rounded-lg bg-[var(--bg-chassis)]" />
        <div className="h-11 flex-1 rounded-lg bg-[var(--bg-chassis)] opacity-60" />
        <div className="h-11 flex-1 rounded-lg bg-[var(--bg-chassis)] opacity-60" />
      </div>

      {/* Accordion Questions Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="industrial-card p-5 h-16 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 w-3/4">
              <div className="h-6 w-10 rounded bg-[var(--bg-recessed)]" />
              <div className="h-4 w-full rounded bg-[var(--bg-recessed)]" />
            </div>
            <div className="h-5 w-5 rounded-full bg-[var(--bg-recessed)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
