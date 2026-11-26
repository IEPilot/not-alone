import Link from "next/link";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { backendName, listMessages, listNotes, listPosts, listSubscribers } from "@/lib/store";
import { formatDate } from "@/lib/markdown";
import { bookChapterCategory } from "@/lib/site";
import { deletePostAction, login, logout, noteAction, togglePublishAction } from "./actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  bad: "That password did not match.",
  wait: "Too many attempts. Please wait a few minutes.",
  setup: "Admin is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET to your environment variables.",
};

export default async function AdminPage({ searchParams }: { searchParams: { error?: string; deleted?: string } }) {
  if (!isAdmin()) {
    return (
      <div className="narrow" style={{ maxWidth: 480 }}>
        <p className="eyebrow">Admin</p>
        <h1>Sign in</h1>
        {!adminConfigured() && (
          <div className="notice">
            Admin is not set up yet. Add <span className="mono">ADMIN_PASSWORD</span> and{" "}
            <span className="mono">SESSION_SECRET</span> to your environment variables, then restart.
          </div>
        )}
        {searchParams.error && errors[searchParams.error] && (
          <div className="notice" role="alert" style={{ borderColor: "var(--danger)" }}>
            {errors[searchParams.error]}
          </div>
        )}
        <form action={login}>
          <div className="field">
            <label htmlFor="pw">Password</label>
            <input id="pw" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn" type="submit">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const [allPosts, subs, msgs, notes] = await Promise.all([
    listPosts({ includeDrafts: true }),
    listSubscribers(),
    listMessages(),
    listNotes(),
  ]);
  const pendingNotes = notes.filter((n) => n.status === "pending");
  const otherNotes = notes.filter((n) => n.status !== "pending").slice(0, 30);
  const posts = allPosts.filter((p) => p.category !== bookChapterCategory);
  const chapters = allPosts.filter((p) => p.category === bookChapterCategory).sort((a, b) => a.slug.localeCompare(b.slug));
  const active = subs.filter((s) => !s.unsubscribed_at);

  return (
    <div className="container">
      <div className="admin-bar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ marginBottom: 0 }}>Your desk</h1>
        </div>
        <div className="row-actions">
          <Link className="btn" href="/admin/new">
            Write a new post
          </Link>
          <form action={logout}>
            <button className="btn btn--ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {searchParams.deleted && <div className="notice">Post deleted.</div>}
      {backendName === "local" && (
        <div className="notice">
          Running on the local development store (a file on this computer). Add{" "}
          <span className="mono">SUPABASE_URL</span> and <span className="mono">SUPABASE_SERVICE_ROLE_KEY</span> to save
          posts, subscribers, and messages to your database.
        </div>
      )}

      <h2 style={{ marginTop: "2rem" }}>Posts</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Date</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/${p.id}`}>{p.title}</Link>
                  {p.featured && <span className="muted mono" style={{ fontSize: "0.72rem" }}> · featured</span>}
                </td>
                <td>
                  <span className={`badge ${p.status === "published" ? "badge--live" : ""}`}>{p.status}</span>
                </td>
                <td className="muted">{p.category}</td>
                <td className="muted">{formatDate(p.published_at || p.created_at)}</td>
                <td>
                  <div className="row-actions">
                    <Link className="btn btn--ghost" href={`/admin/${p.id}`}>
                      Edit
                    </Link>
                    {p.status === "published" && (
                      <Link className="btn btn--ghost" href={`/blog/${p.slug}`}>
                        View
                      </Link>
                    )}
                    <form action={togglePublishAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn btn--ghost" type="submit">
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn btn--danger" type="submit" aria-label={`Delete ${p.title}`}>
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No posts yet. Write the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details style={{ marginTop: "3rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>
          The book: {chapters.length} chapters <span className="muted">(private, not part of the blog)</span>
        </summary>
        <p className="muted" style={{ marginTop: "0.8rem" }}>
          These are the book&apos;s chapters. Only the PDF buyers receive, plus the free Chapter 1 sample, shows them.
          They never appear on the blog.
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chapters.map((c) => (
            <li key={c.id} style={{ padding: "0.35rem 0" }}>
              <Link href={`/admin/${c.id}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </details>

      <h2 style={{ marginTop: "4rem" }}>
        Subscribers <span className="muted mono" style={{ fontSize: "0.9rem" }}>({active.length} active)</span>
      </h2>
      <p>
        <a className="mono" style={{ fontSize: "0.85rem" }} href="/admin/subscribers.csv">
          Download subscribers (CSV)
        </a>
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Joined from</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.slice(0, 25).map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td className="muted">{s.source}</td>
                <td className="muted">{formatDate(s.created_at)}</td>
                <td>
                  <span className={`badge ${s.unsubscribed_at ? "" : "badge--live"}`}>
                    {s.unsubscribed_at ? "unsubscribed" : "active"}
                  </span>
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 id="notes" style={{ marginTop: "4rem" }}>
        Notes wall{" "}
        <span className="muted mono" style={{ fontSize: "0.9rem" }}>
          ({pendingNotes.length} waiting)
        </span>
      </h2>
      <p className="muted">
        New notes wait here until you approve them. Approved notes show on <Link href="/notes">/notes</Link>. Hiding a
        note takes it off the wall but keeps it here.
      </p>
      {notes.length === 0 && <p className="muted">No notes yet.</p>}
      <div className="resource-list">
        {[...pendingNotes, ...otherNotes].map((n) => (
          <div key={n.id} className="resource">
            <p className="muted mono" style={{ fontSize: "0.75rem", marginBottom: "0.6rem" }}>
              <span className={`badge ${n.status === "approved" ? "badge--live" : ""}`}>{n.status}</span>{" "}
              {formatDate(n.created_at)}
              {n.place ? ` · ${n.place}` : ""}
            </p>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)", marginBottom: "0.9rem" }}>{n.body}</p>
            <form action={noteAction} className="row-actions">
              <input type="hidden" name="id" value={n.id} />
              {n.status !== "approved" && (
                <button className="btn" name="action" value="approve">
                  Approve
                </button>
              )}
              {n.status !== "hidden" && (
                <button className="btn btn--ghost" name="action" value="hide">
                  Hide
                </button>
              )}
              <button className="btn btn--danger" name="action" value="delete">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "4rem" }}>Messages</h2>
      {msgs.length === 0 && <p className="muted">No messages yet.</p>}
      <div className="resource-list">
        {msgs.slice(0, 25).map((m) => (
          <div key={m.id} className="resource">
            <h3>
              {m.name || "Anonymous"} {m.email && <span className="muted">· {m.email}</span>}
            </h3>
            <p className="muted mono" style={{ fontSize: "0.75rem", marginBottom: "0.6rem" }}>
              {formatDate(m.created_at)}
            </p>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
