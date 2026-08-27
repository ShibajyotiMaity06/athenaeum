import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="kicker">Lost in the stacks</p>
      <h1 className="font-heading mt-6 text-6xl">404</h1>
      <p className="mt-6 leading-relaxed text-faded">
        The shelf you approached holds no such codex. Perhaps it was reshelved,
        perhaps it never existed — the librarians are famously tight-lipped.
      </p>
      <div className="ornate-divider mx-auto my-10 w-56" aria-hidden="true" />
      <Link href="/" className="btn btn-primary h-12 px-8">
        Return to the entrance hall
      </Link>
    </div>
  );
}
