import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | DevPrep",
  description: "Cancellation and refund guidelines for DevPrep purchases.",
  alternates: { canonical: `${SITE.url}/cancellation-and-refund` }
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>SETTLEMENT POLICY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
            Last Updated: August 28, 2026 · Transparent Customer Assurance
          </p>
        </header>

        <div className="manuscript text-[var(--text-primary)] space-y-8">
          <section>
            <h2>1. Free Preview Before You Pay</h2>
            <p>
              To ensure complete transparency and prevent buyer remorse, DevPrep provides <strong>400+ free unlocked model answers</strong> (5 complete questions per difficulty level across all 27+ technologies) before requiring any payment.
            </p>
            <p>
              We strongly encourage all users to review the quality, depth, and structure of these free preview codices prior to purchasing the Lifetime Access Key.
            </p>
          </section>

          <section>
            <h2>2. Cancellation Policy</h2>
            <p>
              Because DevPrep is a <strong>one-time lifetime payment model with no recurring subscriptions</strong>, there are no ongoing monthly or annual renewals to cancel. Once enrolled, you will never be charged recurring fees.
            </p>
          </section>

          <section>
            <h2>3. Refund Eligibility &amp; Cases</h2>
            <p>
              Refund requests are honored under the following specific circumstances:
            </p>
            <ul>
              <li><strong>Duplicate Transaction:</strong> If your account was charged twice for the same purchase due to a network glitch.</li>
              <li><strong>Payment Debited Without Access:</strong> If your money was deducted but our automated system failed to provision access within 24 hours of reporting the issue.</li>
              <li><strong>Technical Non-Delivery:</strong> If a proven platform failure prevented you from accessing the question codices and our technical support could not resolve it.</li>
            </ul>
          </section>

          <section>
            <h2>4. Refund Processing Timeline</h2>
            <p>
              Upon receiving and approving your refund request, the refund will be initiated immediately through <strong>Razorpay</strong> to your original payment method (Bank Account / UPI / Card).
            </p>
            <ul>
              <li><strong>Processing Time:</strong> 5 to 7 business days depending on your issuing bank&apos;s settlement cycle.</li>
              <li><strong>Refund Fees:</strong> Zero deduction from our end — 100% of the approved amount is credited back.</li>
            </ul>
          </section>

          <section>
            <h2>5. How to Initiate a Refund Request</h2>
            <p>
              To submit a claim, email <a href="mailto:support@devprep.online" className="text-[var(--accent)] font-mono font-bold">support@devprep.online</a> with:
            </p>
            <ol>
              <li>Your registered account email address.</li>
              <li>Razorpay Payment ID (e.g., <code>pay_...</code>).</li>
              <li>A brief description of the issue.</li>
            </ol>
            <p>Our support team reviews and responds to all claims within 24 business hours.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
