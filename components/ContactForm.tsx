"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
          website: fd.get("website"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "ok", text: data.message || "Thank you. Your message has been received." });
        form.reset();
      } else {
        setStatus({ kind: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ kind: "error", text: "We could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="two-col">
        <div className="field">
          <label htmlFor="c-name">Name (or just a first name)</label>
          <input id="c-name" name="name" type="text" autoComplete="given-name" maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="c-email">Email (only if you would like a reply)</label>
          <input id="c-email" name="email" type="email" autoComplete="email" maxLength={200} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-message">Your message</label>
        <textarea id="c-message" name="message" required maxLength={5000} rows={8} />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
      <div className="status" role="status" aria-live="polite" data-kind={status?.kind}>
        {status?.text}
      </div>
    </form>
  );
}
