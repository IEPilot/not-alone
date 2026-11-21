import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default function Unsubscribe({ params, searchParams }: { params: { token: string }; searchParams: { done?: string } }) {
  return (
    <div className="narrow page-head" style={{ maxWidth: 600 }}>
      <p className="eyebrow">Newsletter</p>
      {searchParams.done === "1" ? (
        <>
          <h1>You are unsubscribed.</h1>
          <p className="lede">Thank you for being here. The light stays on whenever you want to come back.</p>
          <Link className="btn btn--ghost" href="/">
            Return home
          </Link>
        </>
      ) : searchParams.done === "0" ? (
        <>
          <h1>We could not find that link.</h1>
          <p className="lede">It may have already been used. If you still receive emails, please send a note through the contact page.</p>
          <Link className="btn btn--ghost" href="/contact">
            Contact
          </Link>
        </>
      ) : (
        <>
          <h1>Leave the list?</h1>
          <p className="lede">No hard feelings. One click and you will stop receiving emails.</p>
          <form action={unsubscribeAction}>
            <input type="hidden" name="token" value={params.token} />
            <button className="btn" type="submit">
              Yes, unsubscribe me
            </button>
          </form>
        </>
      )}
    </div>
  );
}
