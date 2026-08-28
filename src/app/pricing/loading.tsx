export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="h-4 w-36 mx-auto rounded-full bg-[var(--bg-recessed)]" />
        <div className="h-12 w-3/4 mx-auto rounded-2xl bg-[var(--bg-recessed)]" />
        <div className="h-4 w-2/3 mx-auto rounded bg-[var(--bg-recessed)]" />
      </div>

      {/* Main Pricing Card Skeleton */}
      <div className="industrial-card p-8 sm:p-12 text-center max-w-xl mx-auto corner-screws space-y-6">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-recessed)] mx-auto" />
        <div className="h-8 w-2/3 mx-auto rounded-xl bg-[var(--bg-recessed)]" />
        <div className="h-4 w-3/4 mx-auto rounded bg-[var(--bg-recessed)]" />

        <div className="py-6 border-y border-[var(--border-recessed)] space-y-3">
          <div className="h-12 w-48 mx-auto rounded-xl bg-[var(--bg-recessed)]" />
          <div className="h-3 w-40 mx-auto rounded bg-[var(--bg-recessed)]" />
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
          <div className="h-12 w-full rounded-xl bg-[var(--bg-recessed)]" />
          <div className="h-12 w-full rounded-xl bg-[var(--bg-recessed)]" />
        </div>
      </div>

      {/* Feature Guarantee Skeleton */}
      <div className="mt-20 pt-12 border-t border-[var(--border-recessed)] grid gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="industrial-recessed p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-chassis)] mx-auto" />
            <div className="h-4 w-1/2 mx-auto rounded bg-[var(--bg-chassis)]" />
            <div className="h-3 w-3/4 mx-auto rounded bg-[var(--bg-chassis)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
