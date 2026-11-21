import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts();
  const pages = ["", "/blog", "/book", "/about", "/resources", "/contact"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: new Date(),
  }));
  return [
    ...pages,
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}
