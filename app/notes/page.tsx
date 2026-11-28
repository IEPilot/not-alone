import type { Metadata } from "next";
import Link from "next/link";
import NoteForm from "@/components/NoteForm";
import { listNotes } from "@/lib/store";
import { activeMember, reportNoteAction, signOut } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notes from the night",
  description: "Short notes from people who are awake too. Leave one, read a few, and know you are not the only one up.",
};

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function NotesPage({ searchParams }: { searchParams: { reported?: string } }) {
  const [notes, member] = await Promise.all([listNotes({ approvedOnly: true }), activeMember()]);

  return (
    <>
      <section className="container page-head notes-head">
        <div>
          <p className="eyebrow">Notes from the night</p>
          <h1>Leave a light on for someone.</h1>
          <p className="lede">
            A wall of short notes from people who are awake too. Say where you are, what is keeping you up, or just
            that you are here. Someone else will read it at 3 a.m. and feel a little less alone.
          </p>
        </div>
        <div className="notes-form-wrap" id="leave-a-note">
          {member ? (
            <>
              <div className="member-bar">
                Signed in as <strong>{member.username}</strong>
                <form action={signOut} style={{ display: "inline" }}>
                  <button type="submit" className="link-button">
                    Sign out
                  </button>
                </form>
              </div>
              <NoteForm username={member.username} />
            </>
          ) : (
            <div className="card-plain">
              <h2 style={{ fontSize: "1.35rem", marginBottom: "0.6rem" }}>Leaving a note takes a free account</h2>
              <p className="muted" style={{ marginBottom: "1.4rem" }}>
                Just a username and password. No email, and you can still post anonymously.
              </p>
              <div className="hero-actions">
                <Link href="/notes/join" className="btn">
                  Create an account
                </Link>
                <Link href="/notes/sign-in" className="btn btn--ghost">
                  Sign in
                </Link>
              </div>
            </div>
          )}
          <div className="notice" style={{ marginTop: "1.4rem", marginBottom: 0 }}>
            This wall is not watched around the clock and cannot answer back. If you are in danger tonight, call or
            text <strong>988</strong> (United States), or see <Link href="/resources">other places to turn</Link>.
          </div>
        </div>
      </section>

      <section className="container" id="wall" style={{ paddingBottom: "6rem" }} aria-label="Notes">
        {searchParams.reported && (
          <div className="notice" role="status">
            Thank you. Notes reported by more than one person come off the wall automatically.
          </div>
        )}
        {notes.length > 0 ? (
          <ul className="notes-wall">
            {notes.map((n) => (
              <li key={n.id} className="note">
                <p className="note-body">{n.body}</p>
                <p className="note-meta">
                  {n.show_name && n.username ? n.username : "Anonymous"}
                  {n.place ? ` · ${n.place}` : ""} · {when(n.created_at)}
                </p>
                {member && member.id !== n.member_id && (
                  <form action={reportNoteAction} className="note-report">
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="link-button" aria-label="Report this note">
                      Report
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">The wall is new. Yours could be the first note on it.</p>
        )}
      </section>
    </>
  );
}
