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
              Sixteen chapters for the nights that need more than a single essay. Written for the hours after midnight,
              when sleep will not come, when grief sits heavier than usual, when the quiet of the house starts to feel
              less peaceful and more isolating. Each chapter moves through a different shape that hard nights take, with
              reflective questions and small practices woven through, not bolted on.
            </p>
            <p>
              This is not a book about fixing yourself before morning. It is company for the parts of the night that are
              hardest to be alone in.
            </p>
            <p className="muted">{book.statusLine}</p>
            <div className="hero-actions" style={{ marginTop: "2rem" }}>
              <a href={book.buyUrl} className="btn">
                Get the book · {book.price}
              </a>
              <Link href="/book/sample" className="btn btn--ghost">
                Read Chapter 1 free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="inside-title">
        <div className="narrow">
          <blockquote className="prose">
            {book.pullQuote} <cite style={{ display: "block", marginTop: "0.6rem" }}>From Chapter 1</cite>
          </blockquote>
          <p className="eyebrow" style={{ marginTop: "3rem" }}>Contents</p>
          <h2 id="inside-title" style={{ marginBottom: "1.6rem" }}>
            Sixteen chapters, one hour at a time
          </h2>
          <ol className="chapter-list">
            {book.chapters.map((title, i) => (
              <li key={title}>
                <span className="chapter-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{title}</span>
              </li>
            ))}
          </ol>
          <p className="muted" style={{ marginTop: "1.6rem" }}>
            The book is not required reading to be here. The <Link href="/blog">essays on the blog</Link> stand on their
            own. The book is for anyone who wants to go further into the same quiet room.
          </p>
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
            <h2 id="notify-title">Leave your email, and I will let you know about new essays and anything new with the book.</h2>
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
