import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Newsletter from "@/components/Newsletter";
import { getPostBySlug, listPosts } from "@/lib/store";
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

export default async function PostPage({ params }: { params: { slug: string } }) {
  const admin = isAdmin();
  const post = await getPostBySlug(params.slug, { includeDrafts: admin });
  if (!post) notFound();

  const html = renderMarkdown(post.body);
  const all = await listPosts();
  const others = all.filter((p) => p.id !== post.id).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: site.author },
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
