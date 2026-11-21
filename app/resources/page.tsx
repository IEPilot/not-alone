import type { Metadata } from "next";
import { crisis } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description: "Crisis lines, grief support, loneliness and anxiety resources, and ways to find professional help.",
};

type Item = { name: string; text: string; contact?: string; href?: string };

const groups: { id: string; title: string; intro: string; items: Item[] }[] = [
  {
    id: "talk",
    title: "Someone to talk to",
    intro: "Free and confidential support from trained people.",
    items: [
      {
        name: "NAMI HelpLine",
        text: "Information, referrals, and support for people living with mental health conditions and the people who love them. Run by the National Alliance on Mental Illness.",
        contact: "Call 1-800-950-6264 · Text “HelpLine” to 62640",
        href: "https://www.nami.org/help",
      },
      {
        name: "SAMHSA National Helpline",
        text: "A free, confidential treatment referral and information service for mental health and substance use, open every day of the year.",
        contact: "Call 1-800-662-4357",
        href: "https://www.samhsa.gov/find-help/national-helpline",
      },
      {
        name: "Find a Helpline",
        text: "A directory of free, confidential helplines in countries around the world.",
        href: "https://findahelpline.com",
      },
    ],
  },
  {
    id: "grief",
    title: "Grief and loss",
    intro: "People and places that understand the road.",
    items: [
      {
        name: "Modern Loss",
        text: "Candid, thoughtful writing and community around grief of every kind.",
        href: "https://modernloss.com",
      },
      {
        name: "Open to Hope",
        text: "Stories, articles, and resources from people who have walked through loss.",
        href: "https://www.opentohope.com",
      },
      {
        name: "The Dinner Party",
        text: "Peer community for adults who have lost someone, with in-person and online gatherings.",
        href: "https://thedinnerparty.org",
      },
    ],
  },
  {
    id: "therapy",
    title: "Finding a therapist",
    intro: "When you are ready for more steady, professional support.",
    items: [
      {
        name: "Psychology Today therapist finder",
        text: "Search by location, specialty, insurance, and approach to find a therapist or counselor.",
        href: "https://www.psychologytoday.com/us/therapists",
      },
      {
        name: "Open Path Collective",
        text: "Lower-cost sessions with licensed therapists for people who are uninsured or underinsured.",
        href: "https://openpathcollective.org",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="narrow page-head">
        <p className="eyebrow">Resources</p>
        <h1>When you need more than words</h1>
        <p className="lede">
          Reading can help. People can help more. Here are a few trustworthy places to begin, and there is no wrong time to
          reach out.
        </p>
      </section>

      <section className="narrow" aria-labelledby="crisis-title" style={{ paddingBottom: "3rem" }}>
        <div className="crisis" role="region">
          <h2 id="crisis-title">{crisis.headline}</h2>
          <p>{crisis.body}</p>
          <ul className="resource-list">
            {crisis.lines.map((l) => (
              <li key={l.label} className="resource" style={{ background: "var(--bg)" }}>
                <h3 style={{ color: "var(--amber)" }}>{l.label}</h3>
                <p>{l.detail}</p>
              </li>
            ))}
          </ul>
          <p className="form-note">{crisis.outside}</p>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.id} className="narrow" aria-labelledby={`${g.id}-title`} style={{ paddingBottom: "3rem" }}>
          <h2 id={`${g.id}-title`}>{g.title}</h2>
          <p className="muted">{g.intro}</p>
          <ul className="resource-list">
            {g.items.map((it) => (
              <li key={it.name} className="resource">
                <h3>
                  {it.href ? (
                    <a href={it.href} target="_blank" rel="noopener noreferrer">
                      {it.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    it.name
                  )}
                </h3>
                <p>{it.text}</p>
                {it.contact && <p className="contact-line">{it.contact}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="narrow" style={{ paddingBottom: "5rem" }}>
        <div className="prose">
          <h2>Small things for a hard night</h2>
          <ul>
            <li>Turn on one soft light. Put your phone face down for a while.</li>
            <li>Hold something warm: tea, a blanket, a hand on your chest.</li>
            <li>Send one short message to one person: “Rough night. Can you talk?”</li>
            <li>Remind yourself that the hour is not the whole story. Morning is coming, slowly.</li>
          </ul>
          <p className="muted" style={{ fontSize: "0.95rem" }}>
            Listings here are offered for your convenience and are not endorsements. Services and phone numbers can change,
            so please check each organization&apos;s own site. This page is not a substitute for professional care.
          </p>
        </div>
      </section>
    </>
  );
}
