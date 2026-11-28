import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getBookChapterById } from "@/lib/store";
import { saveChapterAction } from "../../actions";

export const dynamic = "force-dynamic";

// Editor for one book chapter. It can only save words; it cannot publish or change a chapter into a post.
export default async function EditChapter({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; error?: string };
}) {
  if (!isAdmin()) redirect("/admin");
  const chapter = await getBookChapterById(params.id);
  if (!chapter) notFound();
  const isOld = chapter.version === "old";

  return (
    <div className="narrow" style={{ maxWidth: 860 }}>
      <Link href="/admin/book" className="back-link">
        ← Back to the book
      </Link>
      <p className="eyebrow">{isOld ? "Book chapter · first version (backup)" : "Book chapter"}</p>
      <h1 style={{ fontSize: "2rem" }}>{chapter.title}</h1>

      <div className="notice">
        {isOld
          ? "This is from the first version of the book. It is a backup only: it is not in the PDF and never appears on the site."
          : "This chapter is private. Changes show up in the book PDF and, for Chapter 1, the free sample. It can never appear on the blog."}
      </div>

      {searchParams.saved && (
        <div className="notice" role="status">
          Saved.
        </div>
      )}
      {searchParams.error && (
        <div className="notice" role="alert" style={{ borderColor: "var(--danger)" }}>
          {searchParams.error}
        </div>
      )}

      <form action={saveChapterAction} className="editor">
        <input type="hidden" name="id" value={chapter.id} />
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required defaultValue={chapter.title} />
        </div>
        <div className="field">
          <label htmlFor="excerpt">Short summary</label>
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={400} defaultValue={chapter.excerpt} style={{ minHeight: "5rem" }} />
        </div>
        <div className="field">
          <label htmlFor="body">Chapter text (Markdown)</label>
          <textarea id="body" name="body" className="body" defaultValue={chapter.body} />
          <p className="form-note">
            Markdown: <span className="mono">## Heading</span>, <span className="mono">**bold**</span>,{" "}
            <span className="mono">*italic*</span>, <span className="mono">- list item</span>,{" "}
            <span className="mono">1. numbered step</span>.
          </p>
        </div>
        <div className="row-actions" style={{ marginTop: "2rem" }}>
          <button type="submit" className="btn">
            Save chapter
          </button>
        </div>
      </form>
    </div>
  );
}
