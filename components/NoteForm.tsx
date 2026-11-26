"use client";

import { FormEvent, useState } from "react";

const NOTE_MAX = 280;
const PLACE_MAX = 40;

export default function NoteForm() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: fd.get("note"), place: fd.get("place"), website: fd.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "ok", text: data.message || "Thank you. Your note is in." });
        form.reset();
        setCount(0);
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
    <form className="note-form" onSubmit={onSubmit} noValidate aria-describedby="note-form-note">
      <div className="field">
        <label htmlFor="n-note">Your note</label>
        <textarea
          id="n-note"
          name="note"
          required
          maxLength={NOTE_MAX}
          rows={4}
          placeholder="Awake again. Missing my dad tonight."
          onChange={(e) => setCount(e.target.value.length)}
        />
        <p className="form-note" aria-live="polite">
          {count}/{NOTE_MAX}
        </p>
      </div>
      <div className="field">
        <label htmlFor="n-place">Where you are (optional)</label>
        <input id="n-place" name="place" type="text" maxLength={PLACE_MAX} placeholder="Buffalo, NY" autoComplete="off" />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="n-website">Website</label>
        <input id="n-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Leaving it…" : "Leave a note"}
      </button>
      <p id="note-form-note" className="form-note">
        No name or email needed. Every note is read by a person before it appears, so please leave out full names,
        phone numbers, and addresses.
      </p>
      <div className="status" role="status" aria-live="polite" data-kind={status?.kind}>
        {status?.text}
      </div>
    </form>
  );
}
