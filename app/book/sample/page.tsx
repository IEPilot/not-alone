import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Newsletter from "@/components/Newsletter";
import { getBookChapter } from "@/lib/store";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { book, sampleChapterSlug } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Read Chapter 1 free",
  description: "A free sample from Not Alone at Midnight: Chapter 1, When the Night Gets Long.",
};

export default async function SamplePage() {
  const chapter = await getBookChapter(sampleChapterSlug);
  if (!chapter) notFound();
  const html = renderMarkdown(chapter.body);

  return (
    <article>
      <header className="narrow article-head">
        <Link href="/book" className="back-link">
          ← The book
        </Link>
        <p className="eyebrow">Free sample · Chapter 1 of {book.chapters.length}</p>
        <h1>{chapter.title}</h1>
        <p className="mono muted" style={{ fontSize: "0.8rem", letterSpacing: "0.06em" }}>
          From {book.title} · {readingMinutes(chapter.body)} min read
        </p>
      </header>

      <div className="narrow article-body">
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="article-end">
          <h2 style={{ fontSize: "1.3rem" }}>If tonight is heavy</h2>
          <p className="muted">
            If you are thinking about ending your life or are in immediate danger, call or text <strong>988</strong>{" "}
            (United States) or visit <Link href="/resources">our resources</Link> for other places to turn.
          </p>
        </div>
      </div>

      <section className="section section--raised">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Keep going</p>
            <h2>There are fifteen more chapters.</h2>
            <p>
              <Link href="/book">See the whole book</Link>, or leave your email and I will let you know when it is ready.
            </p>
          </div>
          <Newsletter source="book-sample" buttonLabel="Notify me" />
        </div>
      </section>
    </article>
  );
}
