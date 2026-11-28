import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { activeMember } from "../actions";
import { safeNext } from "@/lib/safeNext";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to leave a note on the Notes from the night wall.",
  robots: { index: false },
};

export default async function SignInPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next, "");
  if (await activeMember()) redirect(next || "/notes#leave-a-note");
  return (
    <section className="narrow page-head" style={{ maxWidth: 520, paddingBottom: "6rem" }}>
      <Link href={next || "/notes"} className="back-link">
        {next.startsWith("/blog/") ? "← Back to the post" : "← Notes from the night"}
      </Link>
      <p className="eyebrow">Sign in</p>
      <h1 style={{ fontSize: "2rem" }}>Welcome back</h1>
      <MemberForm mode="signin" next={next} />
      <p className="muted" style={{ marginTop: "1.6rem" }}>
        New here? <Link href={next ? `/notes/join?next=${encodeURIComponent(next)}` : "/notes/join"}>Create an account</Link>
      </p>
      <p className="muted" style={{ fontSize: "0.95rem" }}>
        Forgot your password? <Link href="/contact">Send a note</Link> with your username and it can be reset.
      </p>
    </section>
  );
}
