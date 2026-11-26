import { NextResponse } from "next/server";
import { addNote, storageIsWritable } from "@/lib/store";
import { notifyNewNote } from "@/lib/email";
import { clientIp, tooMany } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const NOTE_MAX = 280;
const PLACE_MAX = 40;

const THANKS = "Thank you. Your note is in. It will appear on the wall once it has been read.";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That did not look right. Please try again." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field; people never see it.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ message: THANKS });
  }

  if (tooMany(`note:${clientIp(req)}`, 3)) {
    return NextResponse.json({ error: "Please wait a few minutes before leaving another note." }, { status: 429 });
  }

  const note = String(body.note || "").replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
  const place = String(body.place || "").replace(/\s+/g, " ").trim().slice(0, PLACE_MAX);

  if (note.length < 2) {
    return NextResponse.json({ error: "Please write a few words first." }, { status: 400 });
  }
  if (!storageIsWritable()) {
    return NextResponse.json({ error: "The wall is not taking notes just yet. Please try again soon." }, { status: 503 });
  }

  try {
    await addNote({ body: note, place });
    await notifyNewNote({ body: note, place });
    return NextResponse.json({ message: THANKS });
  } catch (err) {
    console.error("note failed", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a little while." }, { status: 500 });
  }
}
