import Link from "next/link";
import type { Post } from "@/lib/store";
import { formatDate, readingMinutes } from "@/lib/markdown";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="card">
      <div className="card-meta">
        <span className="cat">{post.category}</span>
        <span>{formatDate(post.published_at)}</span>
        <span>{readingMinutes(post.body)} min read</span>
      </div>
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt}</p>
      <span className="card-foot" aria-hidden="true">
        Read →
      </span>
    </article>
  );
}
