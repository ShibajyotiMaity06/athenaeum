"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="kicker">A candle guttered</p>
      <h1 className="font-heading mt-6 text-4xl">Something went astray</h1>
      <p className="mt-5 leading-relaxed text-faded">
        An unexpected difficulty interrupted this page
        {error?.digest ? ` (ref ${error.digest.slice(0, 8)})` : ""}. The archive itself
        is unharmed — try again.
      </p>
      <div className="ornate-divider mx-auto my-10 w-56" aria-hidden="true" />
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button onClick={reset} className="btn btn-primary h-12 px-8">
          Try once more
        </button>
        <Link href="/" className="btn btn-secondary h-12 px-8">
          Entrance hall
        </Link>
      </div>
    </div>
  );
}
