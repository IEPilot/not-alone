"use client";

import { FormEvent, useState } from "react";

type Props = {
  source?: string;
  buttonLabel?: string;
  compact?: boolean;
};

export default function Newsletter({ source = "site", buttonLabel = "Keep me company", compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, real people never fill this
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "ok", text: data.message || "Thank you. You are on the list." });
        setEmail("");
      } else {
        setStatus({ kind: "error", text: data.error || "Something went wrong. Please try again in a moment." });
      }
    } catch {
      setStatus({ kind: "error", text: "We could not reach the server. Please check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  const id = `newsletter-email-${source}`;

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={`${id}-note`}>
      <label htmlFor={id} className={compact ? "sr-only" : undefined}>
        Email address
      </label>
      <div className="inline-form">
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="hp" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Sending…" : buttonLabel}
        </button>
      </div>
      <p id={`${id}-note`} className="form-note">
        A gentle note now and then. Never spam, never pressure. Leave whenever you like with one click.
      </p>
      <div className="status" role="status" aria-live="polite" data-kind={status?.kind}>
        {status?.text}
      </div>
    </form>
  );
}
