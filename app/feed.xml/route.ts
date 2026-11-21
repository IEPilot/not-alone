import { listPosts } from "@/lib/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]!));

export async function GET() {
  const posts = (await listPosts()).slice(0, 30);
  const items = posts
    .map(
      (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${site.url}/blog/${p.slug}</link>
  <guid isPermaLink="true">${site.url}/blog/${p.slug}</guid>
  <pubDate>${new Date(p.published_at || p.created_at).toUTCString()}</pubDate>
  <description>${esc(p.excerpt)}</description>
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.name)}</title>
<link>${site.url}</link>
<description>${esc(site.description)}</description>
<language>en-us</language>
${items}
</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
