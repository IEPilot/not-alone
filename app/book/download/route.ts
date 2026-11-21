import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { listBookChapters } from "@/lib/store";
import { buildBookPdf } from "@/lib/bookPdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function keyMatches(given: string | null): boolean {
  const expected = process.env.BOOK_DOWNLOAD_KEY || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!keyMatches(req.nextUrl.searchParams.get("k"))) {
    return new NextResponse("This download link is not valid.", { status: 403 });
  }
  const chapters = await listBookChapters();
  if (chapters.length === 0) return new NextResponse("The book is not ready yet.", { status: 404 });
  const pdf = await buildBookPdf(chapters);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Not-Alone-at-Midnight.pdf"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
