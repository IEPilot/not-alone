import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { listPosts } from "@/lib/store";
import { categories } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Reflections on grief, loneliness, anxiety, and difficult nights. Written to keep you company.",
};

export default async function BlogIndex({ searchParams }: { searchParams: { category?: string } }) {
  const all = await listPosts();
  const active = categories.includes(searchParams.category || "") ? searchParams.category! : null;
  const posts = active ? all.filter((p) => p.category === active) : all;
  const used = categories.filter((c) => all.some((p) => p.category === c));

  return (
    <>
      <section className="container page-head">
        <p className="eyebrow">The blog</p>
        <h1>Words for the long hours</h1>
        <p className="lede">Slow, honest reflections. Read one, or none, or come back at 3 a.m. They will be here.</p>
        {used.length > 1 && (
          <nav className="filters" aria-label="Filter by topic">
            <Link href="/blog" className="chip" aria-current={!active ? "true" : undefined}>
              All
            </Link>
            {used.map((c) => (
              <Link key={c} href={`/blog?category=${encodeURIComponent(c)}`} className="chip" aria-current={active === c ? "true" : undefined}>
                {c}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section className="container" style={{ paddingBottom: "5rem" }}>
        {posts.length > 0 ? (
          <div className="grid grid--2">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="muted">Nothing here yet. The first words are on their way.</p>
        )}
      </section>

      <section className="section section--raised">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2>Get new reflections by email</h2>
            <p>Only when there is something worth sending.</p>
          </div>
          <Newsletter source="blog" />
        </div>
      </section>
    </>
  );
}
