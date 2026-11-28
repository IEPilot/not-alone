import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import ConfirmButton from "@/components/ConfirmButton";
import Newsletter from "@/components/Newsletter";
import { activeMember, deleteOwnNoteAction, reportNoteAction, signOut } from "@/app/notes/actions";
import { getPostBySlug, listNotes, listPosts } from "@/lib/store";
import { formatDate, readingMinutes, renderMarkdown } from "@/lib/markdown";
import { isAdmin } from "@/lib/auth";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, { includeDrafts: isAdmin() });
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.published_at || undefined },
    robots: post.status === "draft" ? { index: false, follow: false } : undefined,
  };
}

export default async function PostPage({ params, searchParams }: { params: { slug: string }; searchParams: { reported?: string } }) {
  const admin = isAdmin();
  const post = await getPostBySlug(params.slug, { includeDrafts: admin });
  if (!post) notFound();

  const html = renderMarkdown(post.body);
  const all = await listPosts();
  const others = all.filter((p) => p.id !== post.id).slice(0, 2);
  const isLive = post.status === "published";
  const [comments, member] = isLive
    ? await Promise.all([listNotes({ postId: post.id, approvedOnly: true }), activeMember()])
    : [[], null];
  const here = `/blog/${post.slug}`;
  const nextParam = encodeURIComponent(`${here}#comments`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: site.authorFullName },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="narrow article-head">
        <Link href="/blog" className="back-link">
          ← All articles
        </Link>
        {post.status === "draft" && (
          <div className="notice" role="status">
            Draft preview. Only you can see this because you are signed in to admin.
          </div>
        )}
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <p className="mono muted" style={{ fontSize: "0.8rem", letterSpacing: "0.06em" }}>
          {formatDate(post.published_at || post.created_at)} · {readingMinutes(post.body)} min read
        </p>
      </header>

      <div className="narrow article-body">
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="article-end">
          <h2 style={{ fontSize: "1.3rem" }}>If tonight is heavy</h2>
          <p className="muted">
            If you are thinking about ending your life or are in immediate danger, call or text <strong>988</strong> (United
            States) or visit <Link href="/resources">our resources</Link> for other places to turn.
          </p>
        </div>
      </div>

      {isLive && (
        <section className="narrow comments" id="comments" aria-labelledby="comments-title">
          <h2 id="comments-title" style={{ fontSize: "1.4rem" }}>
            {comments.length === 0 ? "Comments" : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          </h2>
          {searchParams.reported && (
            <div className="notice" role="status">
              Thank you. Comments reported by more than one person come down automatically.
            </div>
          )}
          {comments.length > 0 ? (
            <ol className="comment-list">
              {comments.map((c) => (
                <li key={c.id} className="comment">
                  <p className="comment-meta">
                    <strong>{c.show_name && c.username ? c.username : "Anonymous"}</strong> · {formatDate(c.created_at)}
                  </p>
                  <p className="comment-body">{c.body}</p>
                  {member && member.id !== c.member_id && (
                    <form action={reportNoteAction} className="note-report">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="back" value={here} />
                      <button type="submit" className="link-button" aria-label="Report this comment">
                        Report
                      </button>
                    </form>
                  )}
                  {member && member.id === c.member_id && (
                    <form action={deleteOwnNoteAction} className="note-report">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="back" value={here} />
                      <ConfirmButton className="link-button" aria-label="Delete my comment" confirm="Delete your comment? This cannot be undone.">
                        Delete
                      </ConfirmButton>
                    </form>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No comments yet. If this one spoke to you, say so. It helps more than you know.</p>
          )}

          {member ? (
            <>
              <div className="member-bar">
                Commenting as <strong>{member.username}</strong>
                <form action={signOut} style={{ display: "inline" }}>
                  <input type="hidden" name="next" value={here} />
                  <button type="submit" className="link-button">
                    Sign out
                  </button>
                </form>
              </div>
              <CommentForm postId={post.id} username={member.username} />
            </>
          ) : (
            <div className="card-plain">
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Commenting takes a free account</h3>
              <p className="muted" style={{ marginBottom: "1.2rem" }}>
                The same one you use on the notes wall. Just a username and password, no email, and you can still
                comment anonymously.
              </p>
              <div className="hero-actions">
                <Link href={`/notes/join?next=${nextParam}`} className="btn">
                  Create an account
                </Link>
                <Link href={`/notes/sign-in?next=${nextParam}`} className="btn btn--ghost">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="section section--raised">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Stay a while</p>
            <h2>A gentle note, now and then</h2>
            <p>New reflections and news of the book, never anything pushy.</p>
          </div>
          <Newsletter source="article" />
        </div>
      </section>

      {others.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 style={{ fontSize: "1.4rem", marginBottom: "2rem" }}>More to read</h2>
            <div className="grid grid--2">
              {others.map((p) => (
                <article key={p.id} className="card">
                  <div className="card-meta">
                    <span className="cat">{p.category}</span>
                  </div>
                  <h3>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p>{p.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
