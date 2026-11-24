import Link from "next/link";
import { BookCoverArt, RainyWindow } from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import PostCard from "@/components/PostCard";
import { listPosts } from "@/lib/store";
import { book, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await listPosts();
  const featured = posts.filter((p) => p.featured);
  const shown = (featured.length >= 3 ? featured : [...featured, ...posts.filter((p) => !p.featured)]).slice(0, 3);

  return (
    <>
      <section className="hero hero--rain" aria-labelledby="hero-title">
        <div className="hero-art" aria-hidden="true">
          <RainyWindow />
        </div>
        <div className="container hero-inner">
          <div className="hero-glass">
            <p className="eyebrow">A quiet place for hard hours</p>
            <h1 id="hero-title">You don&apos;t have to solve tonight.</h1>
            <p className="lede">
              Just get through this hour, and then the next one. Honest company for grief, loneliness, and the nights
              that feel too long.
            </p>
            <div className="hero-actions">
              <Link href="/book/sample" className="btn">
                Read Chapter 1 free
              </Link>
              <Link href="/book" className="btn btn--glass">
                Get the book · {book.price}
              </Link>
            </div>
          </div>
          <p className="hero-note">{site.tagline}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="welcome-title">
        <div className="narrow">
          <p className="eyebrow">Before anything else</p>
          <h2 id="welcome-title">If you found your way here tonight, I am glad.</h2>
          <div className="prose">
            <p>
              Maybe someone you love is gone. Maybe the house is quiet in a way it never used to be. Maybe your mind will
              not stop, or the holidays are pressing on a place that is already sore.
            </p>
            <p>
              I will not offer you quick fixes or bright slogans. What I can offer is company: honest words written for the
              hours when the world goes still, and a steady reminder that other lights are on, too.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">From the blog</p>
              <h2 id="featured-title">Words for the long hours</h2>
            </div>
            <Link href="/blog" className="text-link">
              All articles →
            </Link>
          </div>
          {shown.length > 0 ? (
            <div className="grid grid--3">
              {shown.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className="muted">The first reflections are on their way.</p>
          )}
        </div>
      </section>

      <section className="pause" aria-label="A reflection">
        <div className="container">
          <div className="glow-dot" aria-hidden="true" />
          <blockquote>The night is long, but it is not endless, and you are not the only one awake in it.</blockquote>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="book-title">
        <div className="container book-feature">
          <div className="book-cover">
            <BookCoverArt />
          </div>
          <div>
            <p className="eyebrow">The book · {book.status}</p>
            <h2 id="book-title">{book.title}</h2>
            <p className="lede">{book.subtitle}.</p>
            <p>
              A companion for loneliness during the holidays, the nighttime, and the turn of the year. Centered on
              presence and witness rather than platitudes.
            </p>
            <div className="hero-actions" style={{ marginTop: "2rem" }}>
              <Link href="/book" className="btn">
                About the book
              </Link>
              <Link href="/book/sample" className="btn btn--ghost">
                Read Chapter 1 free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="resources-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Resources</p>
              <h2 id="resources-title">When you need more than words</h2>
            </div>
            <Link href="/resources" className="text-link">
              See all resources →
            </Link>
          </div>
          <div className="grid grid--3">
            <div className="card">
              <h3>Talk to someone now</h3>
              <p>
                Free, confidential crisis support, any hour. Call or text <strong>988</strong> in the United States, or text
                HOME to <strong>741741</strong>.
              </p>
            </div>
            <div className="card">
              <h3>Grief and loss</h3>
              <p>Communities and organizations that know the road, and people who will sit with you in it.</p>
            </div>
            <div className="card">
              <h3>Anxiety and sleepless nights</h3>
              <p>Calm, practical places to begin, and how to find a therapist when you are ready.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised" id="newsletter" aria-labelledby="news-title">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 id="news-title">A light, delivered gently.</h2>
            <p className="lede">
              An occasional note: a reflection for a hard night, news of the book, nothing more. {site.name} will never
              crowd your inbox.
            </p>
          </div>
          <Newsletter source="home" />
        </div>
      </section>
    </>
  );
}
