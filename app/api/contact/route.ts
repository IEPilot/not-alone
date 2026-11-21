import { NextResponse } from "next/server";
import { addMessage, storageIsWritable } from "@/lib/store";
import { notifyContact } from "@/lib/email";
import { clientIp, tooMany } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That did not look right. Please try again." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ message: "Thank you. Your message has been received." });
  }

  if (tooMany(`msg:${clientIp(req)}`, 5)) {
    return NextResponse.json({ error: "Please wait a few minutes before sending another message." }, { status: 429 });
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (message.length < 2) {
    return NextResponse.json({ error: "Please write a few words before sending." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address does not look right. You can also leave it blank." }, { status: 400 });
  }
  if (!storageIsWritable()) {
    return NextResponse.json({ error: "Messages are not available just yet. Please try again soon." }, { status: 503 });
  }

  try {
    await addMessage({ name, email, message });
    await notifyContact({ name, email, message });
    return NextResponse.json({
      message: email
        ? "Thank you. Your message has been received, and I will reply when I can."
        : "Thank you. Your message has been received.",
    });
  } catch (err) {
    console.error("contact failed", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a little while." }, { status: 500 });
  }
}
