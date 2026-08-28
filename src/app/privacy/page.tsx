import type { Metadata } from "next";
import { ShieldCheck, Lock } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | DevPrep",
  description: "Privacy Policy for DevPrep users and learners.",
  alternates: { canonical: `${SITE.url}/privacy` }
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>DATA PROTECTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
            Last Updated: August 28, 2026 · Compliant with Digital Personal Data Protection Norms
          </p>
        </header>

        <div className="manuscript text-[var(--text-primary)] space-y-8">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect minimal personal data strictly necessary to deliver and authenticate your digital learning experience:
            </p>
            <ul>
              <li><strong>Account Credentials:</strong> Name, email address, and encrypted password hash (or Google profile identifier if using Google OAuth).</li>
              <li><strong>Transaction Data:</strong> Razorpay order ID, payment ID, transaction timestamp, currency, and amount. We never store credit card numbers, CVVs, or bank passwords.</li>
              <li><strong>Technical Usage:</strong> IP address (for geographical currency determination and fraud prevention), browser type, and authentication cookies.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>Your information is used exclusively to:</p>
            <ul>
              <li>Authenticate your account and grant lifetime access to codices upon payment.</li>
              <li>Maintain order history and issue payment receipts.</li>
              <li>Respond to support requests and customer service queries.</li>
              <li>Protect the platform against abuse, scraping, and fraudulent chargebacks.</li>
            </ul>
          </section>

          <section>
            <h2>3. Zero Data Selling &amp; Third-Party Disclosures</h2>
            <p>
              <strong>We never sell, rent, or monetize your personal data.</strong> Your information is only shared with trusted infrastructure providers necessary for platform operations:
            </p>
            <ul>
              <li><strong>Razorpay:</strong> Secure payment settlement gateway.</li>
              <li><strong>Google OAuth:</strong> Optional third-party identity verification.</li>
              <li><strong>MongoDB Atlas:</strong> Encrypted cloud database hosting.</li>
            </ul>
          </section>

          <section>
            <h2>4. Cookie Policy</h2>
            <p>
              DevPrep uses strict <code>httpOnly</code>, <code>SameSite=Lax</code> security cookies (<code>devprep_session</code>) solely for maintaining your authenticated login session and dark/light mode preference. We do not use intrusive third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2>5. Data Retention &amp; Deletion</h2>
            <p>
              Your account and access grants remain active for lifetime preparation. You may request permanent deletion of your account and personal data at any time via the{" "}
              <a href="/contact" className="text-[var(--accent)] font-mono font-bold underline">
                Support Desk
              </a>
              .
            </p>
          </section>

          <section>
            <h2>6. Contact the Privacy Officer</h2>
            <p>
              If you have any questions or data requests, reach out via our{" "}
              <a href="/contact" className="text-[var(--accent)] font-mono font-bold underline">
                Contact Desk
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
