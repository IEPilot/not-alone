import Link from "next/link";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { backendName, listMembers, listMessages, listNotes, listPosts, listSubscribers } from "@/lib/store";
import { formatDate } from "@/lib/markdown";
import { deleteMessageAction, deletePostAction, login, logout, memberAction, noteAction, togglePublishAction } from "./actions";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  bad: "That password did not match.",
  wait: "Too many attempts. Please wait a few minutes.",
  setup: "Admin is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET to your environment variables.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string; deleted?: string; temp?: string; for?: string };
}) {
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

  const [allPosts, subs, msgs, notes, members] = await Promise.all([
    listPosts({ includeDrafts: true }),
    listSubscribers(),
    listMessages(),
    listNotes({ scope: "all" }),
    listMembers(),
  ]);
  const postTitles = new Map(allPosts.map((p) => [p.id, { title: p.title, slug: p.slug }]));
  const heldNotes = notes.filter((n) => n.status === "pending");
  const otherNotes = notes.filter((n) => n.status !== "pending").slice(0, 30);
  const posts = allPosts;
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
          <Link className="btn btn--ghost" href="/admin/book">
            The book
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
                      <ConfirmButton
                        className="btn btn--danger"
                        aria-label={`Delete ${p.title}`}
                        confirm={`Delete "${p.title}" for good? This cannot be undone. (To just take it down, use Unpublish.)`}
                      >
                        Delete
                      </ConfirmButton>
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
        Notes and comments{" "}
        <span className="muted mono" style={{ fontSize: "0.9rem" }}>
          ({notes.filter((n) => n.status === "approved" && !n.post_id).length} on the wall,{" "}
          {notes.filter((n) => n.status === "approved" && n.post_id).length} blog comments)
        </span>
      </h2>
      <p className="muted">
        Members&apos; notes go up on <Link href="/notes">/notes</Link> right away, and their comments go up under
        your blog posts right away; you do not need to do anything. The same rules cover both.
        Notes with links, phone numbers, emails or slurs are refused automatically. Notes about ending a life or
        self-harm are <strong>held</strong> (never shown), and the writer is pointed to 988 straight away. Two reader
        reports take a note down on its own. Use the buttons only if you want to.
      </p>
      {notes.length === 0 && <p className="muted">No notes yet.</p>}
      <div className="resource-list">
        {[...heldNotes, ...otherNotes].map((n) => (
          <div key={n.id} className="resource">
            <p className="muted mono" style={{ fontSize: "0.75rem", marginBottom: "0.6rem" }}>
              <span className={`badge ${n.status === "approved" ? "badge--live" : ""}`}>
                {n.status === "pending" ? "held" : n.status === "approved" ? (n.post_id ? "showing" : "on the wall") : "hidden"}
              </span>{" "}
              {formatDate(n.created_at)} · {n.username ?? "unknown"}
              {n.show_name ? "" : " (posted anonymously)"}
              {n.place ? ` · ${n.place}` : ""}
              {n.reports > 0 ? ` · ${n.reports} report${n.reports === 1 ? "" : "s"}` : ""}
              {n.post_id && (
                <>
                  {" · comment on "}
                  {postTitles.get(n.post_id) ? (
                    <Link href={`/blog/${postTitles.get(n.post_id)!.slug}#comments`}>{postTitles.get(n.post_id)!.title}</Link>
                  ) : (
                    "a post"
                  )}
                </>
              )}
            </p>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)", marginBottom: "0.9rem" }}>{n.body}</p>
            <form action={noteAction} className="row-actions">
              <input type="hidden" name="id" value={n.id} />
              {n.status !== "approved" && (
                <button className="btn btn--ghost" name="action" value="approve">
                  {n.post_id ? "Show it" : "Put on the wall"}
                </button>
              )}
              {n.status === "approved" && (
                <button className="btn btn--ghost" name="action" value="hide">
                  Hide
                </button>
              )}
              <ConfirmButton
                className="btn btn--danger"
                name="action"
                value="delete"
                confirm={`Delete this ${n.post_id ? "comment" : "note"} for good? (To just take it down, use Hide.)`}
              >
                Delete
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>

      <h2 id="members" style={{ marginTop: "4rem" }}>
        Members <span className="muted mono" style={{ fontSize: "0.9rem" }}>({members.length})</span>
      </h2>
      <p className="muted">
        Blocking an account takes down all of its notes and comments and stops it posting. A reset gives the member a new
        temporary password, shown to you once, to pass on to them.
      </p>
      {searchParams?.temp && searchParams?.for && (
        <div className="notice" role="status">
          New password for <strong>{searchParams.for}</strong>: <span className="mono">{searchParams.temp}</span>. Pass it
          on now; it will not be shown again.
        </div>
      )}
      {members.length === 0 && <p className="muted">No members yet.</p>}
      <div className="table-wrap">
        <table className="table">
          <tbody>
            {members.slice(0, 100).map((m) => (
              <tr key={m.id}>
                <td>
                  {m.username}{" "}
                  {m.status === "blocked" && <span className="badge">blocked</span>}
                </td>
                <td className="muted">joined {formatDate(m.created_at)}</td>
                <td>
                  <form action={memberAction} className="row-actions">
                    <input type="hidden" name="id" value={m.id} />
                    {m.status === "active" ? (
                      <button className="btn btn--danger" name="action" value="block">
                        Block
                      </button>
                    ) : (
                      <button className="btn btn--ghost" name="action" value="unblock">
                        Unblock
                      </button>
                    )}
                    <button className="btn btn--ghost" name="action" value="reset">
                      Reset password
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="messages" style={{ marginTop: "4rem" }}>
        Messages <span className="muted mono" style={{ fontSize: "0.9rem" }}>({msgs.length})</span>
      </h2>
      {msgs.length === 0 && <p className="muted">No messages yet.</p>}
      <div className="resource-list">
        {msgs.slice(0, 50).map((m) => (
          <div key={m.id} className="resource">
            <h3>
              {m.name || "Anonymous"} {m.email && <span className="muted">· {m.email}</span>}
            </h3>
            <p className="muted mono" style={{ fontSize: "0.75rem", marginBottom: "0.6rem" }}>
              {formatDate(m.created_at)}
            </p>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)", marginBottom: "0.9rem" }}>{m.message}</p>
            <form action={deleteMessageAction} className="row-actions">
              <input type="hidden" name="id" value={m.id} />
              <ConfirmButton
                className="btn btn--danger"
                confirm={`Delete the message from ${m.name || "Anonymous"} for good?`}
              >
                Delete
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
