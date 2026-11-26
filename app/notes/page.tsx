import type { Metadata } from "next";
import Link from "next/link";
import NoteForm from "@/components/NoteForm";
import { listNotes } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notes from the night",
  description: "Short notes from people who are awake too. Leave one, read a few, and know you are not the only one up.",
};

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function NotesPage() {
  const notes = await listNotes({ approvedOnly: true });

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
        <div className="notes-form-wrap">
          <NoteForm />
          <div className="notice" style={{ marginTop: "1.4rem", marginBottom: 0 }}>
            This wall is not watched around the clock and cannot answer back. If you are in danger tonight, call or
            text <strong>988</strong> (United States), or see <Link href="/resources">other places to turn</Link>.
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }} aria-label="Notes">
        {notes.length > 0 ? (
          <ul className="notes-wall">
            {notes.map((n) => (
              <li key={n.id} className="note">
                <p className="note-body">{n.body}</p>
                <p className="note-meta">
                  {n.place ? `${n.place} · ` : ""}
                  {when(n.created_at)}
                </p>
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
