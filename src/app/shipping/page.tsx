import type { Metadata } from "next";
import { Zap, Truck } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | DevPrep",
  description: "Shipping and digital delivery policy for DevPrep purchases.",
  alternates: { canonical: `${SITE.url}/shipping` }
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>INSTANT ELECTRONIC FULFILLMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
            Last Updated: August 28, 2026 · Digital Goods Delivery Notice
          </p>
        </header>

        <div className="manuscript text-[var(--text-primary)] space-y-8">
          <section>
            <h2>1. Nature of Product (100% Digital SaaS)</h2>
            <p>
              <strong>DevPrep does not sell or ship physical merchandise.</strong> All services offered on <code>devprep.online</code> are 100% digital cloud-based educational software and technical question codices.
            </p>
          </section>

          <section>
            <h2>2. Instant Electronic Delivery Timeline</h2>
            <p>
              Upon successful payment verification through <strong>Razorpay</strong>, delivery of your lifetime access license occurs <strong>immediately and automatically</strong>:
            </p>
            <ul>
              <li><strong>Delivery Method:</strong> Direct account access provisioning via your authenticated login.</li>
              <li><strong>Delivery Timeline:</strong> Instantaneous (0 to 60 seconds from payment completion).</li>
              <li><strong>Confirmation:</strong> An on-screen confirmation and digital ledger record in your <a href="/account" className="text-[var(--accent)] font-bold underline">Account Desk</a>.</li>
            </ul>
          </section>

          <section>
            <h2>3. Shipping Charges</h2>
            <p>
              Since all products and services are delivered digitally over the internet, there are <strong>zero (₹0.00) shipping, courier, or handling charges</strong> for any purchase on DevPrep.
            </p>
          </section>

          <section>
            <h2>4. Delivery Issues &amp; Support</h2>
            <p>
              If your payment was debited but you did not receive immediate access to the locked questions, please:
            </p>
            <ol>
              <li>Log out and log back in to refresh your active session token.</li>
              <li>Check your <a href="/account" className="text-[var(--accent)] font-bold underline">Account Desk</a> to verify order status.</li>
              <li>Email our technical team at <a href="mailto:shibajyoti.maity06@gmail.com" className="text-[var(--accent)] font-mono font-bold">shibajyoti.maity06@gmail.com</a> with your Razorpay Payment ID. We resolve and activate licenses within 2 to 4 business hours.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
