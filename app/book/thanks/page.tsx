import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

export default function ThanksPage({ searchParams }: { searchParams: { k?: string } }) {
  const expected = process.env.BOOK_DOWNLOAD_KEY || "";
  if (!expected || searchParams.k !== expected) notFound();

  return (
    <section className="section">
      <div className="narrow">
        <p className="eyebrow">Thank you</p>
        <h1>Your copy is ready.</h1>
        <div className="prose">
          <p>
            Thank you for being here. I hope these pages keep you company on the long nights. Your receipt is on its way
            to your email from Stripe.
          </p>
          <p>
            <a className="btn" href={`/book/download?k=${encodeURIComponent(expected)}`}>
              Download the book (PDF)
            </a>
          </p>
          <p className="muted">
            Please keep this page for yourself. If the download ever stops working, reply to your receipt email and I
            will send you a fresh copy.
          </p>
          <p>
            If tonight is heavy, call or text <strong>988</strong> (United States), or see the{" "}
            <Link href="/resources">resources page</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
