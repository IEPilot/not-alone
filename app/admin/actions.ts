"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, requireAdmin, startSession, adminConfigured } from "@/lib/auth";
import { deleteNote, deletePost, getBookChapterById, getPostById, saveBookChapter, savePost, setNoteStatus } from "@/lib/store";
import { slugify } from "@/lib/markdown";
import { categories } from "@/lib/site";
import { tooMany } from "@/lib/rateLimit";

export async function login(formData: FormData) {
  if (!adminConfigured()) redirect("/admin?error=setup");
  if (tooMany("admin-login", 8, 15 * 60 * 1000)) redirect("/admin?error=wait");
  const pw = String(formData.get("password") || "");
  if (!checkPassword(pw)) redirect("/admin?error=bad");
  startSession();
  redirect("/admin");
}

export async function logout() {
  endSession();
  redirect("/admin");
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
}

export async function savePostAction(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "") || null;
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "");
  const intent = String(formData.get("intent") || "draft");

  if (!title) redirect(`/admin/${id ?? "new"}?error=${encodeURIComponent("Please give the post a title.")}`);

  const slug = slugify(String(formData.get("slug") || "") || title) || "untitled";
  const category = categories.includes(String(formData.get("category"))) ? String(formData.get("category")) : "Hope";
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 400);
  const featured = formData.get("featured") === "on";

  const existing = id ? await getPostById(id) : null;
  const wantsPublished = intent === "publish";
  const status = wantsPublished ? "published" : intent === "unpublish" ? "draft" : existing?.status ?? "draft";
  const published_at =
    status === "published" ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null;

  let saved;
  try {
    saved = await savePost(id, { slug, title, excerpt, body, category, status, featured, published_at });
  } catch (err: any) {
    redirect(`/admin/${id ?? "new"}?error=${encodeURIComponent(err?.message || "Could not save.")}`);
  }

  revalidateAll();
  redirect(`/admin/${saved.id}?saved=1`);
}

export async function deletePostAction(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await deletePost(id);
  revalidateAll();
  redirect("/admin?deleted=1");
}

export async function togglePublishAction(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  const post = id ? await getPostById(id) : null;
  if (post) {
    const nowPublished = post.status !== "published";
    await savePost(post.id, {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      featured: post.featured,
      status: nowPublished ? "published" : "draft",
      published_at: nowPublished ? post.published_at ?? new Date().toISOString() : post.published_at,
    });
    revalidateAll();
  }
  redirect("/admin");
}

export async function noteAction(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  if (id) {
    if (action === "approve") await setNoteStatus(id, "approved");
    else if (action === "hide") await setNoteStatus(id, "hidden");
    else if (action === "delete") await deleteNote(id);
  }
  revalidatePath("/notes");
  redirect("/admin#notes");
}

export async function saveChapterAction(formData: FormData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  const chapter = id ? await getBookChapterById(id) : null;
  if (!chapter) redirect("/admin#book");
  const title = String(formData.get("title") || "").trim();
  if (!title) redirect(`/admin/book/${id}?error=${encodeURIComponent("Please give the chapter a title.")}`);
  await saveBookChapter(id, {
    title,
    excerpt: String(formData.get("excerpt") || "").trim().slice(0, 400),
    body: String(formData.get("body") || ""),
  });
  revalidatePath("/book/sample");
  redirect(`/admin/book/${id}?saved=1`);
}
