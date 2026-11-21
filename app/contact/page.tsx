import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a note. Every message is read.",
};

export default function ContactPage() {
  return (
    <>
      <section className="narrow page-head">
        <p className="eyebrow">Contact</p>
        <h1>Say hello</h1>
        <p className="lede">A question, a story, a thank-you, or a thought. Every message is read, and I reply when I can.</p>
      </section>

      <section className="narrow" style={{ paddingBottom: "5rem" }}>
        <div className="notice">
          <strong>Please note:</strong> this form is not monitored around the clock, so it is not the right place for an
          emergency. If you are in crisis, call or text <strong>988</strong> (United States) or see our{" "}
          <Link href="/resources">resources</Link>.
        </div>
        <ContactForm />
        {site.contactEmail && (
          <p className="muted" style={{ marginTop: "2rem" }}>
            You can also write to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </p>
        )}
      </section>
    </>
  );
}
