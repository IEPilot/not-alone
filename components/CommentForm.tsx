"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { postComment, type FormState } from "@/app/notes/actions";

const COMMENT_MAX = 1000;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending}>
      {pending ? "Posting…" : "Post comment"}
    </button>
  );
}

export default function CommentForm({ postId, username }: { postId: string; username: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [count, setCount] = useState(0);
  const [state, action] = useFormState<FormState, FormData>(async (prev, fd) => {
    const res = await postComment(prev, fd);
    if (res?.kind === "ok") {
      formRef.current?.reset();
      setCount(0);
    }
    return res;
  }, null);

  return (
    <form ref={formRef} className="note-form comment-form" action={action}>
      <input type="hidden" name="post_id" value={postId} />
      <div className="field">
        <label htmlFor="c-comment">Your comment</label>
        <textarea
          id="c-comment"
          name="comment"
          required
          maxLength={COMMENT_MAX}
          rows={4}
          placeholder="This one hit home for me."
          onChange={(e) => setCount(e.target.value.length)}
        />
        <p className="form-note" aria-live="polite">
          {count}/{COMMENT_MAX}
        </p>
      </div>
      <div className="field">
        <label className="check-label">
          <input type="checkbox" name="anonymous" />
          Comment anonymously (hide my username, {username})
        </label>
      </div>
      <Submit />
      <p className="form-note">Comments go up right away. Please leave out full names, phone numbers, addresses and links.</p>
      {state && (
        <div className={state.kind === "crisis" ? "notice notice--crisis" : "status"} role="status" aria-live="polite" data-kind={state.kind}>
          {state.text}
        </div>
      )}
    </form>
  );
}
