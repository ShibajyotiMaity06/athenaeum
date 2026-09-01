import Link from "next/link";
import GeoPrice from "@/components/GeoPrice";
import { SITE, TECH_CATEGORIES, ROLE_PILLARS } from "@/lib/site";
import { listStacks } from "@/lib/content";

export default function SiteFooter() {
  const allStacks = listStacks();

  return (
    <footer className="border-t border-[var(--border-recessed)] bg-[var(--bg-chassis)] pt-16 pb-12 text-sm text-[var(--text-muted)] transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Brand & Overview */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] pb-12 border-b border-[var(--border-recessed)]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-mono font-black text-sm shadow-[var(--shadow-btn-primary)]">
                D
              </div>
              <span className="font-sans font-black text-xl text-[var(--text-primary)] tracking-tight">
                DevPrep
              </span>
            </div>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)] max-w-sm">
              The systematic technical interview preparation platform. 3,600+ curated questions graded across Easy, Medium, and Hard across 27+ technologies. One-time <GeoPrice className="font-bold text-[var(--text-primary)]" /> lifetime access.
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs text-[var(--text-primary)]">
              <span className="led-indicator led-green" />
              <span>SYSTEM OPERATIONAL // ALL CODICES ONLINE</span>
            </div>
          </div>

          {/* Role Pillars, Platform & Compliance Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <span className="stamped-label mb-4 block">CAREER PILLARS</span>
              <ul className="space-y-2.5 text-xs font-mono">
                {Object.values(ROLE_PILLARS).map((rp) => (
                  <li key={rp.slug}>
                    <Link
                      href={`/${rp.slug}`}
                      className="hover:text-[var(--accent)] transition-colors"
                    >
                      {rp.roleName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="stamped-label mb-4 block">PLATFORM</span>
              <ul className="space-y-2.5 text-xs font-mono">
                <li>
                  <Link href="/interview-prep" className="hover:text-[var(--accent)] transition-colors text-[var(--accent)] font-bold">
                    Interview Prep Codex
                  </Link>
                </li>
                <li>
                  <Link href="/#technologies" className="hover:text-[var(--accent)] transition-colors">
                    All Technologies
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[var(--accent)] transition-colors">
                    Lifetime Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-[var(--accent)] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-[var(--accent)] transition-colors">
                    Account Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="stamped-label mb-4 block">POLICIES &amp; COMPLIANCE</span>
              <ul className="space-y-2.5 text-xs font-mono">
                <li>
                  <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-[var(--accent)] transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation-and-refund" className="hover:text-[var(--accent)] transition-colors">
                    No-Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[var(--accent)] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact#report" className="hover:text-[var(--accent)] transition-colors text-[var(--accent)] font-semibold">
                    Report an Error
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Full Sitemap-Style Category Grid (Crawlable <a> tags for SEO) ── */}
        <div className="py-12 border-b border-[var(--border-recessed)]">
          <span className="stamped-label mb-6 block text-[var(--accent)]">
            COMPLETE DIRECTORY OF ALL 27+ TECHNOLOGY CODICES
          </span>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 text-xs">
            {TECH_CATEGORIES.map((cat) => {
              const catStacks = allStacks.filter((s) => cat.slugs.includes(s.slug));
              return (
                <div key={cat.name}>
                  <h4 className="font-bold text-[var(--text-primary)] mb-3 font-mono text-[11px] uppercase tracking-wider">
                    {cat.name}
                  </h4>
                  <ul className="space-y-2">
                    {catStacks.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/${s.hubSlug}`}
                          className="hover:text-[var(--accent)] transition-colors block text-[var(--text-muted)] hover:underline"
                        >
                          {s.name} Questions
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <p>© 2026 DevPrep (www.devprep.online) · All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/shipping" className="hover:underline">Shipping</Link>
            <span>·</span>
            <Link href="/cancellation-and-refund" className="hover:underline">No-Refunds</Link>
            <span>·</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
