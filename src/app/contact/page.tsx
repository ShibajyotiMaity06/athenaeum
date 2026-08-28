import type { Metadata } from "next";
import { Mail, Clock, MapPin, ShieldCheck, Headphones } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | DevPrep",
  description: "Get in touch with DevPrep support, billing, or enterprise inquiries.",
  alternates: { canonical: `${SITE.url}/contact` }
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="industrial-card p-8 sm:p-12 corner-screws">
        <header className="mb-10 pb-6 border-b border-[var(--border-recessed)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <Headphones className="w-3.5 h-3.5" />
            <span>CUSTOMER DESK // DIRECT CONTACT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Contact Us
          </h1>
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
            We are dedicated to supporting engineers, scholars, and platform partners.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          {/* Email Support Card */}
          <div className="industrial-recessed p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-chassis)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-[var(--shadow-card)]">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Email Support</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                For billing assistance, Razorpay transaction verification, technical support, and account inquiries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border-recessed)]">
              <a
                href="mailto:support@devprep.online"
                className="font-mono text-xs font-bold text-[var(--accent)] hover:underline"
              >
                support@devprep.online
              </a>
            </div>
          </div>

          {/* Response SLA Card */}
          <div className="industrial-recessed p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-chassis)] text-emerald-500 flex items-center justify-center mb-4 shadow-[var(--shadow-card)]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Operating Hours &amp; SLA</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Monday to Saturday · 9:00 AM – 7:00 PM IST (Indian Standard Time).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border-recessed)] font-mono text-xs text-[var(--text-primary)]">
              Response Time: <strong>Within 24 business hours</strong>
            </div>
          </div>
        </div>

        {/* Official Entity & Address Details */}
        <div className="manuscript text-[var(--text-primary)] space-y-6 pt-6 border-t border-[var(--border-recessed)]">
          <section>
            <h2>Entity &amp; Administrative Details</h2>
            <p>
              <strong>Brand Name:</strong> DevPrep (<code>devprep.online</code>)
            </p>
            <p>
              <strong>Nature of Business:</strong> Educational Technology (EdTech) &amp; Digital Interview Preparation Software.
            </p>
            <p>
              <strong>Operating Address:</strong> Kolkata, West Bengal, India — PIN: 700001
            </p>
            <p>
              <strong>Payment Partner:</strong> Razorpay Software Private Limited (PCI-DSS Level 1 Certified).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
