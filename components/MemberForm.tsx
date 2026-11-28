"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type FormState } from "@/app/notes/actions";

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending}>
      {pending ? busy : label}
    </button>
  );
}

export default function MemberForm({ mode }: { mode: "join" | "signin" }) {
  const [state, action] = useFormState<FormState, FormData>(mode === "join" ? signUp : signIn, null);
  const id = (s: string) => `${mode}-${s}`;

  return (
    <form action={action} className="member-form">
      <div className="field">
        <label htmlFor={id("username")}>Username</label>
        <input
          id={id("username")}
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
        />
        {mode === "join" && <p className="form-note">3 to 20 letters, numbers, underscores or periods. Do not use your real full name.</p>}
      </div>
      <div className="field">
        <label htmlFor={id("password")}>Password</label>
        <input
          id={id("password")}
          name="password"
          type="password"
          required
          minLength={mode === "join" ? 8 : 1}
          autoComplete={mode === "join" ? "new-password" : "current-password"}
        />
        {mode === "join" && <p className="form-note">At least 8 characters. There is no email reset, so keep it somewhere safe.</p>}
      </div>
      {mode === "join" && (
        <div className="hp" aria-hidden="true">
          <label htmlFor={id("website")}>Website</label>
          <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      )}
      <Submit label={mode === "join" ? "Create account" : "Sign in"} busy={mode === "join" ? "Creating…" : "Signing in…"} />
      {state && (
        <div className="status" role="status" aria-live="polite" data-kind={state.kind}>
          {state.text}
        </div>
      )}
    </form>
  );
}
