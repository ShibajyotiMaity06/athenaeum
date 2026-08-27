import Link from "next/link";
import { SITE } from "@/lib/site";
import { listStacks } from "@/lib/content";

export default function SiteFooter() {
  const stacks = listStacks().slice(0, 6);
  return (
    <footer className="border-t border-grain bg-oak/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded border border-brass/60 text-lg text-brass">
                ✶
              </span>
              <span className="font-display text-sm uppercase tracking-[0.28em]">Athenaeum</span>
            </div>
            <p className="mt-5 max-w-md leading-relaxed text-faded">
              A gated reading room of engineering codices — curated questions,
              disciplined levels and implementation folios, kept under one brass key.
            </p>
          </div>

          <nav aria-label="Collections">
            <p className="kicker mb-5">Collections</p>
            <ul className="grid gap-3">
              {stacks.map((s) => (
                <li key={s.slug}>
                  <Link href={`/library/${s.slug}`} className="link-brass font-body text-[15px]">
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/library" className="link-brass font-body text-[15px] italic">
                  All volumes →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="The Society">
            <p className="kicker mb-5">The Society</p>
            <ul className="grid gap-3 text-[15px]">
              <li><Link href="/pricing" className="link-brass">Terms of Access</Link></li>
              <li><Link href="/#proclamation" className="link-brass">Proclamation</Link></li>
              <li><Link href="/#faq" className="link-brass">Questions Posed</Link></li>
              <li><Link href="/account" className="link-brass">Your Desk</Link></li>
            </ul>
          </nav>
        </div>

        <div className="ornate-divider my-12" aria-hidden="true" />

        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="text-sm text-faded">
            © {SITE.established} · {SITE.name}. Set in Cormorant Garamond &amp; Crimson Pro.
          </p>
          <p className="text-xs tracking-[0.2em] text-faded uppercase font-display">
            Knowledge wants a careful reader
          </p>
        </div>
      </div>
    </footer>
  );
}
