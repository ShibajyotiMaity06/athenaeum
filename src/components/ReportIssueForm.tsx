"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send, Loader2, MessageSquare, Bug, HelpCircle, ShieldAlert } from "lucide-react";

interface ReportIssueFormProps {
  defaultCategory?: string;
  defaultUrl?: string;
  className?: string;
}

export default function ReportIssueForm({
  defaultCategory = "content_error",
  defaultUrl = "",
  className = ""
}: ReportIssueFormProps) {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState(defaultUrl);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      setErrorMessage("Please provide both your email address and a description of the issue.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category,
          subject,
          message,
          url: url || (typeof window !== "undefined" ? window.location.href : "")
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit report. Please try again.");
      }

      setStatus("success");
      setMessage("");
      setSubject("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={`industrial-card p-6 sm:p-8 corner-screws ${className}`} id="report">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] font-mono text-[11px] font-bold uppercase tracking-wider">
          <Bug className="w-3.5 h-3.5" />
          <span>REPORT DESK // DIRECT TRANSMISSION</span>
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
        Report an Error or Issue
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)] font-mono">
        Found a mistake in a question, experienced a platform glitch, or have an inquiry? Submit details below.
      </p>

      {status === "success" ? (
        <div className="mt-6 p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
          <h3 className="font-bold text-base text-[var(--text-primary)]">Report Submitted Successfully</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md">
            Thank you! Your report has been dispatched directly to our technical desk. We will investigate the issue and follow up at <strong className="text-[var(--text-primary)]">{email}</strong> if needed.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-5 px-4 py-2 text-xs font-mono font-bold rounded bg-[var(--bg-recessed)] hover:bg-[var(--border-recessed)] text-[var(--text-primary)] transition-colors border border-[var(--border-recessed)]"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {status === "error" && errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* User Email */}
            <div>
              <label htmlFor="report-email" className="block text-xs font-mono font-bold text-[var(--text-primary)] mb-1.5">
                Your Email Address <span className="text-[var(--accent)]">*</span>
              </label>
              <input
                id="report-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 text-xs rounded bg-[var(--bg-recessed)] border border-[var(--border-recessed)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="report-category" className="block text-xs font-mono font-bold text-[var(--text-primary)] mb-1.5">
                Issue Category <span className="text-[var(--accent)]">*</span>
              </label>
              <select
                id="report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded bg-[var(--bg-recessed)] border border-[var(--border-recessed)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono transition-colors"
              >
                <option value="Question / Content Error">Question or Answer Error / Bug</option>
                <option value="Payment & Access Issue">Payment / Lifetime Access Issue</option>
                <option value="Platform Bug / UI Glitch">Platform Bug / UI Glitch</option>
                <option value="Account / Login Assistance">Account / Login Assistance</option>
                <option value="General Inquiry">General Feedback / Inquiry</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="report-subject" className="block text-xs font-mono font-bold text-[var(--text-primary)] mb-1.5">
              Subject / Short Summary <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
            </label>
            <input
              id="report-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Typo in React Q14 explanation or Payment verification delay"
              className="w-full px-3.5 py-2.5 text-xs rounded bg-[var(--bg-recessed)] border border-[var(--border-recessed)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono transition-colors"
            />
          </div>

          {/* Message Description */}
          <div>
            <label htmlFor="report-message" className="block text-xs font-mono font-bold text-[var(--text-primary)] mb-1.5">
              Problem Description &amp; Details <span className="text-[var(--accent)]">*</span>
            </label>
            <textarea
              id="report-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe what went wrong, the question name/number, or steps to reproduce the problem..."
              className="w-full px-3.5 py-2.5 text-xs rounded bg-[var(--bg-recessed)] border border-[var(--border-recessed)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono transition-colors resize-y"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              Direct dispatch to technical team · Average turnaround: &lt; 24 business hours
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-[var(--accent)] hover:brightness-110 text-white font-mono font-bold text-xs shadow-[var(--shadow-btn-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
