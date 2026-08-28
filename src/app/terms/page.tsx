import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions | DevPrep",
  description: "Terms and Conditions for using DevPrep technical interview preparation services.",
  alternates: { canonical: `${SITE.url}/terms` }
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>LEGAL DOCUMENTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
            Last Updated: August 28, 2026 · Effective Immediately
          </p>
        </header>

        <div className="manuscript text-[var(--text-primary)] space-y-8">
          <section>
            <h2>1. Introduction &amp; Acceptance</h2>
            <p>
              Welcome to <strong>DevPrep</strong> (accessible at <code>devprep.online</code>). These Terms and Conditions govern your access to and use of DevPrep&apos;s digital platform, coding interview codices, technical model answers, and digital educational materials.
            </p>
            <p>
              By accessing or creating an account on DevPrep, you agree to be bound by these Terms. If you do not agree, you must discontinue use of the platform immediately.
            </p>
          </section>

          <section>
            <h2>2. Digital Services &amp; Lifetime License</h2>
            <p>
              DevPrep provides comprehensive technical interview preparation materials structured across multiple engineering technologies and difficulty tiers.
            </p>
            <ul>
              <li><strong>Free Tier:</strong> Unrestricted access to the first 5 questions per difficulty tier across all technologies without registration.</li>
              <li><strong>Lifetime Scholar Key:</strong> A single, one-time payment of ₹399 (INR) or $9 (USD) grants permanent, non-transferable, non-exclusive access to all 3,600+ questions, verified model answers, and future question additions.</li>
              <li>There are no recurring charges or annual subscription renewals.</li>
            </ul>
          </section>

          <section>
            <h2>3. User Accounts &amp; Security</h2>
            <p>
              When creating an account or signing in with Google OAuth, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
            <p>
              Account sharing or distributing authenticated credentials to multiple individuals is strictly prohibited and may result in immediate revocation of access without refund.
            </p>
          </section>

          <section>
            <h2>4. Intellectual Property Rights</h2>
            <p>
              All curriculum designs, explanations, code solutions, design systems, illustrations, and software architectures published on DevPrep are the exclusive intellectual property of DevPrep.
            </p>
            <p>
              You may not copy, scrape, distribute, reproduce, republish, resell, or commercially exploit any content from DevPrep without prior written authorization.
            </p>
          </section>

          <section>
            <h2>5. Payments &amp; Settlement</h2>
            <p>
              All digital payment transactions are securely processed through authorized third-party payment gateways (including <strong>Razorpay</strong>). DevPrep does not store sensitive credit card numbers or UPI PINs on its servers.
            </p>
          </section>

          <section>
            <h2>6. Disclaimer of Warranties</h2>
            <p>
              DevPrep materials are provided on an &quot;as is&quot; and &quot;as available&quot; basis for educational and interview preparation purposes. While we strive for absolute accuracy, DevPrep does not guarantee employment outcomes or specific interview results at any company.
            </p>
          </section>

          <section>
            <h2>7. Contact Information</h2>
            <p>
              For legal inquiries or questions regarding these terms, contact us at:{" "}
              <a href="mailto:support@devprep.online" className="text-[var(--accent)] font-mono font-bold">
                support@devprep.online
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
