// A small storage layer with two backends:
//  - Supabase (when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set) for production
//  - A local JSON file in ./.data for development, so the site works the moment you run it
import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { bookChapterCategory } from "@/lib/site";
// @ts-ignore - plain JS module shared with the seed script
import { seedPosts } from "@/content/seed-posts.mjs";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInput = Omit<Post, "id" | "created_at" | "updated_at">;

type Subscriber = {
  id: string;
  email: string;
  source: string;
  token: string;
  created_at: string;
  unsubscribed_at: string | null;
};

type Message = { id: string; name: string; email: string; message: string; created_at: string };

type LocalDb = { posts: Post[]; subscribers: Subscriber[]; messages: Message[] };

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const backendName = hasSupabase ? "supabase" : "local";

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/* ------------------------------ local backend ------------------------------ */

const DATA_FILE = path.join(process.cwd(), ".data", "store.json");

function seedLocal(): Post[] {
  return (seedPosts as any[]).map((p) => {
    const when = new Date(Date.now() - p.daysAgo * 86400000).toISOString();
    return {
      id: randomUUID(),
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      status: "published" as const,
      featured: Boolean(p.featured),
      published_at: when,
      created_at: when,
      updated_at: when,
    };
  });
}

async function readLocal(): Promise<LocalDb> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as LocalDb;
  } catch {
    const fresh: LocalDb = { posts: seedLocal(), subscribers: [], messages: [] };
    await writeLocal(fresh);
    return fresh;
  }
}

async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

/* --------------------------------- posts ---------------------------------- */

const byNewest = (a: Post, b: Post) =>
  new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();

export async function listPosts(opts: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  if (hasSupabase) {
    let q = sb().from("nam_posts").select("*");
    if (!opts.includeDrafts) q = q.eq("status", "published").neq("category", bookChapterCategory);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ((data || []) as Post[]).sort(byNewest);
  }
  const db = await readLocal();
  const posts = opts.includeDrafts ? db.posts : db.posts.filter((p) => p.status === "published" && p.category !== bookChapterCategory);
  return [...posts].sort(byNewest);
}

export async function getPostBySlug(slug: string, opts: { includeDrafts?: boolean } = {}): Promise<Post | null> {
  if (hasSupabase) {
    let q = sb().from("nam_posts").select("*").eq("slug", slug);
    if (!opts.includeDrafts) q = q.eq("status", "published").neq("category", bookChapterCategory);
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Post) || null;
  }
  const db = await readLocal();
  const p = db.posts.find((x) => x.slug === slug);
  if (!p || (!opts.includeDrafts && (p.status !== "published" || p.category === bookChapterCategory))) return null;
  return p;
}

// Fetches one book chapter by its exact slug, whatever its status. Callers decide which chapters are public.
export async function getBookChapter(slug: string): Promise<Post | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_posts").select("*").eq("slug", slug).eq("category", bookChapterCategory).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Post) || null;
  }
  const db = await readLocal();
  return db.posts.find((x) => x.slug === slug && x.category === bookChapterCategory) || null;
}

export async function getPostById(id: string): Promise<Post | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_posts").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Post) || null;
  }
  const db = await readLocal();
  return db.posts.find((p) => p.id === id) || null;
}

export async function savePost(id: string | null, input: PostInput): Promise<Post> {
  const now = new Date().toISOString();
  if (hasSupabase) {
    const row = { ...input, updated_at: now };
    if (id) {
      const { data, error } = await sb().from("nam_posts").update(row).eq("id", id).select().single();
      if (error) throw new Error(error.code === "23505" ? "That web address (slug) is already used by another post." : error.message);
      return data as Post;
    }
    const { data, error } = await sb().from("nam_posts").insert(row).select().single();
    if (error) throw new Error(error.code === "23505" ? "That web address (slug) is already used by another post." : error.message);
    return data as Post;
  }
  const db = await readLocal();
  if (db.posts.some((p) => p.slug === input.slug && p.id !== id)) {
    throw new Error("That web address (slug) is already used by another post.");
  }
  if (id) {
    const i = db.posts.findIndex((p) => p.id === id);
    if (i === -1) throw new Error("Post not found.");
    db.posts[i] = { ...db.posts[i], ...input, updated_at: now };
    await writeLocal(db);
    return db.posts[i];
  }
  const post: Post = { id: randomUUID(), ...input, created_at: now, updated_at: now };
  db.posts.push(post);
  await writeLocal(db);
  return post;
}

export async function deletePost(id: string): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  db.posts = db.posts.filter((p) => p.id !== id);
  await writeLocal(db);
}

/* ------------------------------- subscribers ------------------------------ */

export async function addSubscriber(email: string, source: string): Promise<{ isNew: boolean; token: string }> {
  const clean = email.trim().toLowerCase();
  if (hasSupabase) {
    const existing = await sb().from("nam_subscribers").select("id, token, unsubscribed_at").eq("email", clean).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) {
      if (existing.data.unsubscribed_at) {
        const { error } = await sb().from("nam_subscribers").update({ unsubscribed_at: null, source }).eq("id", existing.data.id);
        if (error) throw new Error(error.message);
        return { isNew: true, token: existing.data.token };
      }
      return { isNew: false, token: existing.data.token };
    }
    const { data, error } = await sb().from("nam_subscribers").insert({ email: clean, source }).select("token").single();
    if (error) throw new Error(error.message);
    return { isNew: true, token: data.token };
  }
  const db = await readLocal();
  const found = db.subscribers.find((s) => s.email === clean);
  if (found) {
    if (found.unsubscribed_at) {
      found.unsubscribed_at = null;
      await writeLocal(db);
      return { isNew: true, token: found.token };
    }
    return { isNew: false, token: found.token };
  }
  const sub: Subscriber = {
    id: randomUUID(),
    email: clean,
    source,
    token: randomUUID(),
    created_at: new Date().toISOString(),
    unsubscribed_at: null,
  };
  db.subscribers.push(sub);
  await writeLocal(db);
  return { isNew: true, token: sub.token };
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;
  const now = new Date().toISOString();
  if (hasSupabase) {
    const { data, error } = await sb()
      .from("nam_subscribers")
      .update({ unsubscribed_at: now })
      .eq("token", token)
      .select("id");
    if (error) throw new Error(error.message);
    return (data || []).length > 0;
  }
  const db = await readLocal();
  const s = db.subscribers.find((x) => x.token === token);
  if (!s) return false;
  s.unsubscribed_at = now;
  await writeLocal(db);
  return true;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_subscribers").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Subscriber[];
  }
  const db = await readLocal();
  return [...db.subscribers].reverse();
}

/* -------------------------------- messages -------------------------------- */

export async function addMessage(m: { name: string; email: string; message: string }): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_messages").insert(m);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  db.messages.push({ id: randomUUID(), ...m, created_at: new Date().toISOString() });
  await writeLocal(db);
}

export async function listMessages(): Promise<Message[]> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_messages").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Message[];
  }
  const db = await readLocal();
  return [...db.messages].reverse();
}

export function storageIsWritable(): boolean {
  // On Vercel the filesystem is read-only, so the local backend cannot persist there.
  return hasSupabase || !process.env.VERCEL;
}
