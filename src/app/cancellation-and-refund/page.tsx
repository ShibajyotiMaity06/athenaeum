import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Ban } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "No Refund & Cancellation Policy | DevPrep",
  description: "DevPrep strict no-refund and no-cancellation policy for lifetime digital access.",
  alternates: { canonical: `${SITE.url}/cancellation-and-refund` }
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 font-mono text-xs font-bold uppercase tracking-wider mb-3 border border-rose-500/20">
            <Ban className="w-3.5 h-3.5" />
            <span>STRICT NO-REFUND POLICY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            No Refund &amp; Cancellation Policy
          </h1>

        </header>

        <div className="manuscript text-[var(--text-primary)] space-y-8">
          <section>
            <h2>1. Strict No-Refund Policy</h2>
            <p>
              <strong>DevPrep does not offer refunds under any circumstances once a purchase is completed. All sales are final.</strong>
            </p>
            <p>
              Because our product is a 100% digital educational codex providing immediate, unrestricted, and permanent access to 3,600+ questions and verified model answers, digital access cannot be returned or refunded once provisioned.
            </p>
          </section>

          <section>
            <h2>2. No Cancellation Needed (Zero Subscriptions)</h2>
            <p>
              DevPrep is a <strong>one-time lifetime fee</strong>. We do not charge recurring monthly, quarterly, or yearly subscriptions. Because there are no recurring billing cycles, <strong>no cancellation is required</strong>. You will never be billed again after your initial payment.
            </p>
          </section>

          <section>
            <h2>3. Try 400+ Free Questions Before Purchasing</h2>
            <p>
              To ensure buyers are completely confident in their decision, DevPrep provides <strong>400+ free unlocked questions and model answers</strong> (5 questions per difficulty tier across all 27+ technologies) accessible to every visitor before payment.
            </p>
            <p>
              Please review these free questions to evaluate the quality, depth, and structure of the codices before buying.
            </p>
          </section>

          <section>
            <h2>4. Duplicate Payment Resolution Only</h2>
            <p>
              The only exception processed is an accidental duplicate transaction caused by a network glitch where your bank account was debited multiple times for a single order. In such cases, visit our <a href="/contact" className="text-[var(--accent)] font-mono font-bold underline">Contact Desk</a> with the duplicate transaction IDs to reverse the extra charge.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
