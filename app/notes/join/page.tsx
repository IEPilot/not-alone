import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { activeMember } from "../actions";
import { safeNext } from "@/lib/safeNext";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "A free account for leaving notes on the Notes from the night wall.",
  robots: { index: false },
};

export default async function JoinPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next, "");
  if (await activeMember()) redirect(next || "/notes#leave-a-note");
  return (
    <section className="narrow page-head" style={{ maxWidth: 520, paddingBottom: "6rem" }}>
      <Link href={next || "/notes"} className="back-link">
        {next.startsWith("/blog/") ? "← Back to the post" : "← Notes from the night"}
      </Link>
      <p className="eyebrow">Create an account</p>
      <h1 style={{ fontSize: "2rem" }}>Join the wall</h1>
      <p className="muted">
        Pick a username and a password. That is all. Your notes can show your username, or you can post anonymously
        any time.
      </p>
      <MemberForm mode="join" next={next} />
      <p className="muted" style={{ marginTop: "1.6rem" }}>
        Already have an account? <Link href={next ? `/notes/sign-in?next=${encodeURIComponent(next)}` : "/notes/sign-in"}>Sign in</Link>
      </p>
    </section>
  );
}
