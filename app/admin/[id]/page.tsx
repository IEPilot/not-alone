import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/store";
import { categories } from "@/lib/site";
import { savePostAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPost({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; error?: string };
}) {
  if (!isAdmin()) redirect("/admin");

  const isNew = params.id === "new";
  const post = isNew ? null : await getPostById(params.id);
  if (!isNew && !post) notFound();

  return (
    <div className="narrow" style={{ maxWidth: 860 }}>
      <Link href="/admin" className="back-link">
        ← Back to your desk
      </Link>
      <p className="eyebrow">{isNew ? "New post" : "Edit post"}</p>
      <h1 style={{ fontSize: "2rem" }}>{isNew ? "Write something true" : post!.title}</h1>

      {searchParams.saved && (
        <div className="notice" role="status">
          Saved. {post?.status === "published" ? "This post is live." : "This post is still a draft."}
        </div>
      )}
      {searchParams.error && (
        <div className="notice" role="alert" style={{ borderColor: "var(--danger)" }}>
          {searchParams.error}
        </div>
      )}

      <form action={savePostAction} className="editor">
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required defaultValue={post?.title ?? ""} />
        </div>

        <div className="two-col">
          <div className="field">
            <label htmlFor="slug">Web address (optional)</label>
            <input id="slug" name="slug" type="text" placeholder="made-from-the-title" defaultValue={post?.slug ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={post?.category ?? "Hope"}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="excerpt">Short summary (shown on cards and in search results)</label>
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={400} defaultValue={post?.excerpt ?? ""} style={{ minHeight: "5rem" }} />
        </div>

        <div className="field">
          <label htmlFor="body">Article (Markdown)</label>
          <textarea id="body" name="body" className="body" defaultValue={post?.body ?? ""} />
          <p className="form-note">
            Markdown: <span className="mono">## Heading</span>, <span className="mono">**bold**</span>,{" "}
            <span className="mono">*italic*</span>, <span className="mono">&gt; quote</span>,{" "}
            <span className="mono">- list item</span>, <span className="mono">---</span> for a small amber pause.
          </p>
        </div>

        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: "0.7rem", textTransform: "none", letterSpacing: 0 }}>
            <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} style={{ width: "auto" }} />
            Feature this post on the home page
          </label>
        </div>

        <div className="row-actions" style={{ marginTop: "2rem" }}>
          <button type="submit" name="intent" value="publish" className="btn">
            {post?.status === "published" ? "Save and keep live" : "Publish"}
          </button>
          <button type="submit" name="intent" value="draft" className="btn btn--ghost">
            Save as draft
          </button>
          {post?.status === "published" && (
            <button type="submit" name="intent" value="unpublish" className="btn btn--ghost">
              Unpublish
            </button>
          )}
          {post?.status === "published" && (
            <Link className="btn btn--ghost" href={`/blog/${post.slug}`}>
              View live
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
