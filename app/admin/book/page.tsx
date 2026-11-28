import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listBookChapters } from "@/lib/store";

export const dynamic = "force-dynamic";

// The book has its own page in admin, kept completely apart from blog posts.
export default async function AdminBookPage() {
  if (!isAdmin()) redirect("/admin");
  const [chapters, oldChapters] = await Promise.all([listBookChapters("current"), listBookChapters("old")]);
  const numbered = chapters.filter((c) => !c.slug.startsWith("chapter-00-"));

  return (
    <div className="narrow" style={{ maxWidth: 860, paddingBottom: "5rem" }}>
      <Link href="/admin" className="back-link">
        ← Back to your desk
      </Link>
      <p className="eyebrow">The book</p>
      <h1 style={{ fontSize: "2rem" }}>Not Alone at Midnight</h1>
      <p className="muted">
        Opening note + {numbered.length} chapters. The book is stored on its own, separate from your blog posts, so a
        chapter can never be published by accident. Buyers get it as the PDF, and Chapter 1 is the free sample. Click a
        chapter to fix a typo; there is no publish button.
      </p>

      <ol className="chapter-list" style={{ marginTop: "2rem" }}>
        {chapters.map((c) => (
          <li key={c.id}>
            <span className="chapter-num">{c.slug.startsWith("chapter-00-") ? "" : c.slug.slice(8, 10)}</span>
            <Link href={`/admin/book/${c.id}`}>{c.title}</Link>
          </li>
        ))}
      </ol>
      {chapters.length === 0 && <p className="muted">No chapters found.</p>}

      {oldChapters.length > 0 && (
        <details style={{ marginTop: "3rem" }}>
          <summary style={{ cursor: "pointer" }} className="muted">
            First version of the book ({oldChapters.length} chapters, backup only, not in the PDF)
          </summary>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {oldChapters.map((c) => (
              <li key={c.id} style={{ padding: "0.35rem 0" }}>
                <Link href={`/admin/book/${c.id}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
