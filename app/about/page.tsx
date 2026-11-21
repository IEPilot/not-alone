import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export const metadata: Metadata = {
  title: "About",
  description: "Why this place exists, who writes it, and what you can expect here.",
};

export default function AboutPage() {
  return (
    <>
      <section className="narrow page-head">
        <p className="eyebrow">About</p>
        <h1>A light left on</h1>
        <p className="lede">Not Alone at Midnight began with a simple idea: no one should have to carry the hardest hours entirely by themselves.</p>
      </section>

      <section className="narrow" style={{ paddingBottom: "4rem" }}>
        <div className="prose">
          <p>
            Some nights are heavier than others. Grief gets louder. Worry multiplies. A quiet house starts to feel like an
            echo. In those hours it can seem as if everyone else is asleep, or fine, or somewhere you are not.
          </p>
          <p>
            This site is my attempt to leave a light on for anyone in that hour. It is a small, quiet corner of the
            internet, with no feeds to scroll, no countdowns, and no pressure to feel better by any particular time.
          </p>

          <h2>What you will find here</h2>
          <ul>
            <li>
              <strong>Reflections</strong> on grief, loneliness, anxiety, and difficult nights, written plainly and with
              care.
            </li>
            <li>
              <strong>A book in progress</strong> about companionship through the hours and seasons that feel the longest.
            </li>
            <li>
              <strong>Resources</strong> for when you need more than words: crisis lines, grief communities, and ways to
              find a therapist.
            </li>
          </ul>

          <h2>What this is not</h2>
          <p>
            I am not a doctor or a therapist, and nothing here is medical advice or a replacement for professional care.
            I write as someone who believes deeply that being witnessed matters, and that no one should be left to wait for
            morning alone. If you need clinical support or are in crisis, please{" "}
            <Link href="/resources">reach out to the people who can help</Link>.
          </p>

          <h2>How I would like this to feel</h2>
          <p>
            Compassionate, honest, and hopeful, though never in a rush. I do not believe in forced cheer or tidy
            lessons. I do believe in company, small kindnesses, and the way a single light in a window can change what a
            dark street feels like.
          </p>

          <p style={{ marginTop: "2.5rem" }}>
            Thank you for being here.
            <br />
            <span className="signature">Brian</span>
          </p>
        </div>
      </section>

      <section className="section section--raised">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Stay in touch</p>
            <h2>Join the quiet list</h2>
            <p>An occasional note, and the first word when the book is ready.</p>
          </div>
          <Newsletter source="about" />
        </div>
      </section>
    </>
  );
}
