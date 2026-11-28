// A small storage layer with two backends:
//  - Supabase (when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set) for production
//  - A local JSON file in ./.data for development, so the site works the moment you run it
import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
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

export type NoteStatus = "pending" | "approved" | "hidden";
export type Note = {
  id: string;
  body: string;
  place: string;
  status: NoteStatus;
  member_id: string | null;
  show_name: boolean;
  reports: number;
  post_id: string | null; // set when this is a comment on a blog post; null for the notes wall
  username: string | null; // the author's username, filled in when listing
  created_at: string;
};

export type MemberStatus = "active" | "blocked";
export type Member = {
  id: string;
  username: string;
  username_lc: string;
  password_hash: string;
  status: MemberStatus;
  created_at: string;
};

// Book chapters are kept apart from blog posts. "current" is the book buyers get; "old" is the first version, kept as a backup.
export type ChapterVersion = "current" | "old";
export type BookChapter = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  version: ChapterVersion;
  created_at: string;
  updated_at: string;
};

type LocalDb = {
  posts: Post[];
  subscribers: Subscriber[];
  messages: Message[];
  notes?: Note[];
  members?: Member[];
  reports?: { note_id: string; member_id: string }[];
  chapters?: BookChapter[];
};

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
    if (!opts.includeDrafts) q = q.eq("status", "published");
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ((data || []) as Post[]).sort(byNewest);
  }
  const db = await readLocal();
  const posts = opts.includeDrafts ? db.posts : db.posts.filter((p) => p.status === "published");
  return [...posts].sort(byNewest);
}

export async function getPostBySlug(slug: string, opts: { includeDrafts?: boolean } = {}): Promise<Post | null> {
  if (hasSupabase) {
    let q = sb().from("nam_posts").select("*").eq("slug", slug);
    if (!opts.includeDrafts) q = q.eq("status", "published");
    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Post) || null;
  }
  const db = await readLocal();
  const p = db.posts.find((x) => x.slug === slug);
  if (!p || (!opts.includeDrafts && p.status !== "published")) return null;
  return p;
}

/* ------------------------------ book chapters ------------------------------ */

// One current chapter by its exact slug (used for the free sample). Callers decide what is public.
export async function getBookChapter(slug: string): Promise<BookChapter | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_book_chapters").select("*").eq("slug", slug).eq("version", "current").maybeSingle();
    if (error) throw new Error(error.message);
    return (data as BookChapter) || null;
  }
  const db = await readLocal();
  return (db.chapters || []).find((c) => c.slug === slug && c.version === "current") || null;
}

export async function listBookChapters(version: ChapterVersion = "current"): Promise<BookChapter[]> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_book_chapters").select("*").eq("version", version).order("slug", { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []) as BookChapter[];
  }
  const db = await readLocal();
  return (db.chapters || []).filter((c) => c.version === version).sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getBookChapterById(id: string): Promise<BookChapter | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_book_chapters").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as BookChapter) || null;
  }
  const db = await readLocal();
  return (db.chapters || []).find((c) => c.id === id) || null;
}

// Saves a chapter's words. There is deliberately no way to publish a chapter or turn it into a post.
export async function saveBookChapter(id: string, input: { title: string; excerpt: string; body: string }): Promise<void> {
  const row = { ...input, updated_at: new Date().toISOString() };
  if (hasSupabase) {
    const { error } = await sb().from("nam_book_chapters").update(row).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  const c = (db.chapters || []).find((x) => x.id === id);
  if (c) Object.assign(c, row);
  await writeLocal(db);
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

export async function deleteMessage(id: string): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  db.messages = db.messages.filter((m) => m.id !== id);
  await writeLocal(db);
}

/* ---------------------------------- notes ---------------------------------- */
// Notes from members go up right away ("approved"). Notes the automatic checks hold back are "pending"
// and never shown. "hidden" notes were reported twice, hidden by you, or belong to a blocked member.

type NoteRow = Omit<Note, "username"> & { nam_members?: { username: string } | null };

function withUsername(r: NoteRow): Note {
  const { nam_members, ...rest } = r;
  return { ...rest, username: nam_members?.username ?? null };
}

export async function addNote(n: {
  body: string;
  place: string;
  member_id: string;
  show_name: boolean;
  status: NoteStatus;
  post_id?: string | null;
}): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_notes").insert(n);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  db.notes = db.notes || [];
  db.notes.push({ id: randomUUID(), ...n, post_id: n.post_id ?? null, reports: 0, username: null, created_at: new Date().toISOString() });
  await writeLocal(db);
}

// Public wall: approved notes only. Admin: everything, newest first.
// "wall" is the notes wall only, "comments" is blog comments only, "all" is both.
// With postId: that post's comments, oldest first, so a conversation reads top to bottom.
export async function listNotes(
  opts: { approvedOnly?: boolean; limit?: number; scope?: "wall" | "comments" | "all"; postId?: string } = {},
): Promise<Note[]> {
  const limit = opts.limit ?? 200;
  const scope = opts.postId ? "comments" : opts.scope ?? "wall";
  const oldestFirst = Boolean(opts.postId);
  if (hasSupabase) {
    let q = sb()
      .from("nam_notes")
      .select("*, nam_members!nam_notes_member_id_fkey(username)")
      .order("created_at", { ascending: oldestFirst })
      .limit(limit);
    if (opts.approvedOnly) q = q.eq("status", "approved");
    if (opts.postId) q = q.eq("post_id", opts.postId);
    else if (scope === "wall") q = q.is("post_id", null);
    else if (scope === "comments") q = q.not("post_id", "is", null);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return ((data || []) as NoteRow[]).map(withUsername);
  }
  const db = await readLocal();
  const names = new Map((db.members || []).map((m) => [m.id, m.username]));
  const notes = (db.notes || [])
    .map((n) => ({ ...n, post_id: n.post_id ?? null }))
    .filter((n) => !opts.approvedOnly || n.status === "approved")
    .filter((n) =>
      opts.postId ? n.post_id === opts.postId : scope === "wall" ? !n.post_id : scope === "comments" ? Boolean(n.post_id) : true,
    );
  return (oldestFirst ? notes : [...notes].reverse())
    .slice(0, limit)
    .map((n) => ({ ...n, username: n.member_id ? names.get(n.member_id) ?? null : null }));
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_notes").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? ({ ...(data as Note), username: null } as Note) : null;
  }
  const db = await readLocal();
  const n = (db.notes || []).find((x) => x.id === id);
  return n ? { ...n, post_id: n.post_id ?? null } : null;
}

export async function setNoteStatus(id: string, status: NoteStatus): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_notes").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  const n = (db.notes || []).find((x) => x.id === id);
  if (n) n.status = status;
  await writeLocal(db);
}

export async function deleteNote(id: string): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_notes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  db.notes = (db.notes || []).filter((x) => x.id !== id);
  await writeLocal(db);
}

// One report per member per note. Returns the note's new report count.
export async function reportNote(noteId: string, memberId: string): Promise<number> {
  if (hasSupabase) {
    const ins = await sb().from("nam_note_reports").insert({ note_id: noteId, member_id: memberId });
    if (ins.error && ins.error.code !== "23505") throw new Error(ins.error.message);
    const { count, error } = await sb().from("nam_note_reports").select("*", { count: "exact", head: true }).eq("note_id", noteId);
    if (error) throw new Error(error.message);
    await sb().from("nam_notes").update({ reports: count ?? 0 }).eq("id", noteId);
    return count ?? 0;
  }
  const db = await readLocal();
  db.reports = db.reports || [];
  if (!db.reports.some((r) => r.note_id === noteId && r.member_id === memberId)) db.reports.push({ note_id: noteId, member_id: memberId });
  const count = db.reports.filter((r) => r.note_id === noteId).length;
  const n = (db.notes || []).find((x) => x.id === noteId);
  if (n) n.reports = count;
  await writeLocal(db);
  return count;
}

/* --------------------------------- members --------------------------------- */

export async function createMember(username: string, password_hash: string): Promise<Member> {
  if (hasSupabase) {
    const { data, error } = await sb()
      .from("nam_members")
      .insert({ username, username_lc: username.toLowerCase(), password_hash })
      .select()
      .single();
    if (error) throw new Error(error.code === "23505" ? "That username is taken." : error.message);
    return data as Member;
  }
  const db = await readLocal();
  db.members = db.members || [];
  if (db.members.some((m) => m.username_lc === username.toLowerCase())) throw new Error("That username is taken.");
  const m: Member = { id: randomUUID(), username, username_lc: username.toLowerCase(), password_hash, status: "active", created_at: new Date().toISOString() };
  db.members.push(m);
  await writeLocal(db);
  return m;
}

export async function getMemberByUsername(username: string): Promise<Member | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_members").select("*").eq("username_lc", username.toLowerCase()).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Member) || null;
  }
  const db = await readLocal();
  return (db.members || []).find((m) => m.username_lc === username.toLowerCase()) || null;
}

export async function getMemberById(id: string): Promise<Member | null> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_members").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Member) || null;
  }
  const db = await readLocal();
  return (db.members || []).find((m) => m.id === id) || null;
}

export async function listMembers(): Promise<Member[]> {
  if (hasSupabase) {
    const { data, error } = await sb().from("nam_members").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Member[];
  }
  const db = await readLocal();
  return [...(db.members || [])].reverse();
}

// Blocking an account also takes all of its notes off the wall. Unblocking does not put them back.
export async function setMemberStatus(id: string, status: MemberStatus): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_members").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    if (status === "blocked") await sb().from("nam_notes").update({ status: "hidden" }).eq("member_id", id);
    return;
  }
  const db = await readLocal();
  const m = (db.members || []).find((x) => x.id === id);
  if (m) m.status = status;
  if (status === "blocked") for (const n of db.notes || []) if (n.member_id === id) n.status = "hidden";
  await writeLocal(db);
}

export async function setMemberPassword(id: string, password_hash: string): Promise<void> {
  if (hasSupabase) {
    const { error } = await sb().from("nam_members").update({ password_hash }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = await readLocal();
  const m = (db.members || []).find((x) => x.id === id);
  if (m) m.password_hash = password_hash;
  await writeLocal(db);
}

export function storageIsWritable(): boolean {
  // On Vercel the filesystem is read-only, so the local backend cannot persist there.
  return hasSupabase || !process.env.VERCEL;
}
