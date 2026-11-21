import Link from "next/link";

export default function NotFound() {
  return (
    <section className="narrow page-head" style={{ paddingBottom: "6rem" }}>
      <p className="eyebrow">Page not found</p>
      <h1>That page is not here.</h1>
      <p className="lede">Not every path leads somewhere, and that is all right. Let us get you back to the light.</p>
      <div className="hero-actions" style={{ marginTop: "2rem" }}>
        <Link href="/" className="btn">
          Return home
        </Link>
        <Link href="/blog" className="btn btn--ghost">
          Read the blog
        </Link>
      </div>
    </section>
  );
}
