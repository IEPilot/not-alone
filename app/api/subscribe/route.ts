import { NextResponse } from "next/server";
import { addSubscriber, storageIsWritable } from "@/lib/store";
import { sendWelcome } from "@/lib/email";
import { clientIp, tooMany } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["site", "home", "footer", "book", "blog", "article", "about", "book-sample"]);

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That did not look right. Please try again." }, { status: 400 });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ message: "Thank you. You are on the list." });
  }

  if (tooMany(`sub:${clientIp(req)}`)) {
    return NextResponse.json({ error: "That is a lot of tries. Please wait a few minutes and come back." }, { status: 429 });
  }

  const email = String(body.email || "").trim();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "That email address does not look quite right. Would you check it?" }, { status: 400 });
  }

  if (!storageIsWritable()) {
    return NextResponse.json(
      { error: "Signups are not available just yet. Please try again soon." },
      { status: 503 }
    );
  }

  const source = SOURCES.has(String(body.source)) ? String(body.source) : "site";

  try {
    const { isNew, token } = await addSubscriber(email, source);
    if (isNew) await sendWelcome(email.toLowerCase(), token);
    // Same message whether or not the address was already on the list, so no one can probe who is subscribed.
    return NextResponse.json({ message: "Thank you. You are on the list, and you are not alone." });
  } catch (err) {
    console.error("subscribe failed", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a little while." }, { status: 500 });
  }
}
