// Loads the starter articles into your Supabase database. Safe to run more than once.
// Usage:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
import { createClient } from "@supabase/supabase-js";
import { seedPosts } from "../content/seed-posts.mjs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const rows = seedPosts.map((p) => {
  const when = new Date(Date.now() - p.daysAgo * 86400000).toISOString();
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    category: p.category,
    featured: Boolean(p.featured),
    status: "published",
    published_at: when,
  };
});

// ignoreDuplicates keeps any post you have already edited.
const { error } = await sb.from("nam_posts").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`Starter articles are in place (${rows.length} checked).`);
