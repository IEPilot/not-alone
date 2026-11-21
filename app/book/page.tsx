import type { Metadata } from "next";
import Link from "next/link";
import { BookCoverArt } from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import { book } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Book",
  description: `${book.title}: ${book.subtitle}. A companion for loneliness at night, during the holidays, and at the turn of the year.`,
};

export default function BookPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.subtitle,
    inLanguage: "en",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="section" aria-labelledby="book-h1" style={{ paddingBottom: "3rem" }}>
        <div className="container book-feature">
          <div className="book-cover">
            <BookCoverArt />
          </div>
          <div>
            <p className="eyebrow">The book · {book.status}</p>
            <h1 id="book-h1">{book.title}</h1>
            <p className="lede">{book.subtitle}.</p>
            <p>
              For the person staring at the ceiling at 2 a.m. For the first holiday with an empty chair. For the long
              stretch between Christmas and New Year&apos;s when everyone else seems to be celebrating. This is a book that
              sits beside you instead of cheering you up.
            </p>
            <p className="muted">{book.statusLine}</p>
            <div className="hero-actions" style={{ marginTop: "2rem" }}>
              <Link href="#notify" className="btn">
                Tell me when it is ready
              </Link>
              <Link href="/blog" className="btn btn--ghost">
                Read a few pages from the blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="inside-title">
        <div className="container">
          <p className="eyebrow">What it is about</p>
          <h2 id="inside-title" style={{ marginBottom: "2.4rem" }}>
            Company, not correction
          </h2>
          <div className="grid grid--2">
            {book.themes.map((t) => (
              <div className="card" key={t.title}>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="who-title">
        <div className="narrow">
          <p className="eyebrow">Who it is for</p>
          <h2 id="who-title">You, if any of this sounds familiar</h2>
          <div className="prose">
            <ul>
              <li>Nights have become the hardest part of your day.</li>
              <li>You are grieving, and people expect you to be further along.</li>
              <li>The holidays feel quieter than they are supposed to.</li>
              <li>You are surrounded by people and still feel alone.</li>
              <li>You are tired of advice and would simply like some honest company.</li>
            </ul>
            <blockquote>
              Nothing in these pages asks you to be okay. It only asks you to stay for one more page.
            </blockquote>
            <p className="muted" style={{ fontSize: "0.95rem" }}>
              This book offers companionship and reflection. It is not medical or mental health treatment. If you are in
              crisis, please see the <Link href="/resources">resources page</Link> or call or text 988 in the United States.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--raised" id="notify" aria-labelledby="notify-title">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Be the first to know</p>
            <h2 id="notify-title">Leave your email, and I will let you know when the book is ready.</h2>
            <p>
              That is the only thing I will use it for, plus the occasional reflection if you stay on the list. One click
              and you are gone whenever you like.
            </p>
          </div>
          <Newsletter source="book" buttonLabel="Notify me" />
        </div>
      </section>
    </>
  );
}
