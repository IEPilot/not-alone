"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { postNote, type FormState } from "@/app/notes/actions";

const NOTE_MAX = 280;
const PLACE_MAX = 40;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending}>
      {pending ? "Leaving it…" : "Leave a note"}
    </button>
  );
}

export default function NoteForm({ username }: { username: string }) {
  const [state, action] = useFormState<FormState, FormData>(async (prev, fd) => {
    const res = await postNote(prev, fd);
    if (res?.kind === "ok") {
      formRef.current?.reset();
      setCount(0);
    }
    return res;
  }, null);
  const [count, setCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} className="note-form" action={action} aria-describedby="note-form-note">
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
      <div className="field">
        <label className="check-label">
          <input type="checkbox" name="anonymous" />
          Post anonymously (hide my username, {username})
        </label>
      </div>
      <Submit />
      <p id="note-form-note" className="form-note">
        Notes go up right away. Please leave out full names, phone numbers, addresses and links.
      </p>
      {state && (
        <div className={state.kind === "crisis" ? "notice notice--crisis" : "status"} role="status" aria-live="polite" data-kind={state.kind}>
          {state.text}
        </div>
      )}
    </form>
  );
}
