// Builds the book PDF on request from the chapters stored in the database,
// so the full text never lives in the public code repository.
import "server-only";
import PDFDocument from "pdfkit";
import path from "path";
import { book, site } from "@/lib/site";
import type { Post } from "@/lib/store";

const F = (name: string) => path.join(process.cwd(), "assets", "fonts", name);
const INK = "#1d2126";
const SOFT = "#5b6570";
const AMBER = "#b97d1c"; // readable amber on white
const NIGHT = "#111316";
const GLOW = "#e5a850";

type Run = { text: string; italic: boolean };

function runs(s: string): Run[] {
  const out: Run[] = [];
  const parts = s.split(/(\*[^*]+\*)/g).filter(Boolean);
  for (const p of parts) {
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) out.push({ text: p.slice(1, -1), italic: true });
    else out.push({ text: p, italic: false });
  }
  return out;
}

export function buildBookPdf(chapters: Post[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [432, 648], // 6 x 9 inches
      margins: { top: 64, bottom: 72, left: 56, right: 56 },
      bufferPages: true,
      info: { Title: book.title, Author: site.author, Subject: book.subtitle },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Body", F("nunito-latin-400-normal.woff"));
    doc.registerFont("BodyItalic", F("nunito-latin-400-italic.woff"));
    doc.registerFont("Bold", F("nunito-latin-800-normal.woff"));
    doc.registerFont("BoldItalic", F("nunito-latin-800-italic.woff"));
    doc.registerFont("Mono", F("nunito-latin-700-normal.woff"));

    const W = doc.page.width;
    const H = doc.page.height;
    const contentW = W - 112;

    /* ------------------------------- cover ------------------------------- */
    doc.rect(0, 0, W, H).fill(NIGHT);
    const glow = doc.radialGradient(W / 2, 190, 0, W / 2, 190, 120);
    glow.stop(0, GLOW, 0.55).stop(1, GLOW, 0);
    doc.circle(W / 2, 190, 120).fill(glow);
    doc.circle(W / 2, 190, 4).fill(GLOW);
    doc.fillColor("#e8ebee").font("Bold").fontSize(30).text("Not Alone", 0, 330, { width: W, align: "center" });
    doc.text("at Midnight", 0, 368, { width: W, align: "center" });
    doc.fillColor("#9aa4ae").font("Mono").fontSize(8.5).text(book.subtitle.toUpperCase(), 48, 430, {
      width: W - 96,
      align: "center",
      characterSpacing: 1.2,
      lineGap: 4,
    });
    doc.page.margins.bottom = 0;
    doc.fillColor("#9aa4ae").font("Mono").fontSize(9).text(site.author.toUpperCase(), 0, H - 70, {
      width: W,
      align: "center",
      characterSpacing: 2,
    });

    /* ----------------------------- front matter -------------------------- */
    doc.addPage();
    doc.page.margins.bottom = 0;
    doc.fillColor(INK).font("Mono").fontSize(8.5).text("BEFORE YOU BEGIN", { characterSpacing: 1.5 });
    doc.moveDown(1.2);
    doc.font("Body").fontSize(10.5).fillColor(INK).text(
      "This book is not a program and it will not ask you to fix yourself before morning. Read a page, or a chapter, or just one line. Stop whenever you like. Each chapter ends with a small practice, and each has a question you can answer or ignore.",
      { lineGap: 5 },
    );
    doc.moveDown(1);
    doc.text(
      "It offers companionship and reflection. It is not medical or mental health treatment, and it is not a substitute for care from a professional.",
      { lineGap: 5 },
    );
    doc.moveDown(1.4);
    doc.fillColor(AMBER).font("Mono").fontSize(8.5).text("IF TONIGHT IS HEAVY", { characterSpacing: 1.5 });
    doc.moveDown(0.8);
    doc.fillColor(INK).font("Body").fontSize(10.5).text(
      "If you might act on thoughts of ending your life, or you are in immediate danger, please reach out to someone right now.",
      { lineGap: 5 },
    );
    doc.moveDown(0.6);
    doc.font("Bold").text("Call or text 988", { continued: true }).font("Body").text("  (United States, free, 24 hours)");
    doc.font("Bold").text("Text HOME to 741741", { continued: true }).font("Body").text("  (Crisis Text Line)");
    doc.font("Bold").text("Call 911", { continued: true }).font("Body").text("  for an immediate emergency");
    doc.moveDown(0.6);
    doc.fillColor(SOFT).font("Body").fontSize(9.5).text("Outside the United States, findahelpline.com lists free, confidential helplines by country.", {
      lineGap: 4,
    });
    doc.fillColor(SOFT).font("Mono").fontSize(8).text(
      `© ${new Date().getFullYear()} ${site.author}. For your personal use. Please do not share or resell this file.`,
      56,
      H - 90,
      { width: contentW, lineGap: 3 },
    );

    /* ------------------------------- contents ---------------------------- */
    doc.addPage();
    doc.fillColor(INK).font("Mono").fontSize(8.5).text("CONTENTS", { characterSpacing: 1.5 });
    doc.moveDown(1.2);
    chapters.forEach((c, i) => {
      const y = doc.y;
      doc.fillColor(AMBER).font("Mono").fontSize(8.5).text(String(i + 1).padStart(2, "0"), 56, y + 1.5, { width: 28, lineBreak: false });
      doc.fillColor(INK).font("Body").fontSize(10.5).text(c.title, 90, y, { width: contentW - 34, lineGap: 2 });
      doc.moveDown(0.55);
    });

    /* ------------------------------- chapters ---------------------------- */
    chapters.forEach((c, i) => {
      doc.addPage();
      doc.fillColor(AMBER).font("Mono").fontSize(8.5).text(`CHAPTER ${String(i + 1).padStart(2, "0")}`, 56, 96, { characterSpacing: 2 });
      doc.moveDown(0.5);
      doc.fillColor(INK).font("Bold").fontSize(21).text(c.title, 56, doc.y, { width: contentW, lineGap: 4 });
      doc.moveDown(1.6);

      for (const block of c.body.split(/\n{2,}/)) {
        const t = block.trim();
        if (!t) continue;
        if (t.startsWith(">")) {
          const m = t.replace(/^>\s?/gm, "").match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
          const label = (m ? m[1] : "").replace(/\.$/, "").toUpperCase();
          const text = m ? m[2] : t.replace(/^>\s?/gm, "");
          const x = 56 + 14;
          const w = contentW - 14;
          doc.font("Body").fontSize(10.5);
          const textH = doc.heightOfString(text, { width: w, lineGap: 4 }) + 24;
          if (doc.y + textH > H - 80) doc.addPage();
          const y0 = doc.y;
          doc.fillColor(AMBER).font("Mono").fontSize(7.5).text(label, x, y0, { width: w, characterSpacing: 1.4 });
          doc.moveDown(0.4);
          doc.fillColor(SOFT).font("BodyItalic").fontSize(10.5).text(text, x, doc.y, { width: w, lineGap: 4 });
          const y1 = doc.y;
          doc.moveTo(56, y0 - 1).lineTo(56, y1).lineWidth(1.2).strokeColor(AMBER).stroke();
          doc.x = 56;
          doc.moveDown(1.1);
        } else {
          const rs = runs(t.replace(/\n/g, " "));
          rs.forEach((r, idx) => {
            doc.fillColor(INK).font(r.italic ? "BodyItalic" : "Body").fontSize(10.5);
            doc.text(r.text, idx === 0 ? 56 : undefined, idx === 0 ? doc.y : undefined, {
              width: contentW,
              lineGap: 4.5,
              continued: idx < rs.length - 1,
            });
          });
          doc.moveDown(0.9);
        }
      }
    });

    /* ------------------------------- closing ----------------------------- */
    doc.addPage();
    doc.fillColor(AMBER).circle(W / 2, 200, 3).fill();
    doc.fillColor(INK).font("BodyItalic").fontSize(12).text(
      "If you are awake tonight, you are not the only one. Somewhere, a light is on in another window for the same reason.",
      72,
      230,
      { width: W - 144, align: "center", lineGap: 7 },
    );
    doc.moveDown(2);
    doc.fillColor(SOFT).font("Mono").fontSize(8.5).text(site.name.toUpperCase(), { align: "center", characterSpacing: 1.5 });

    /* ---------------------------- page numbers --------------------------- */
    const range = doc.bufferedPageRange();
    for (let i = 2; i < range.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0;
      doc.fillColor(SOFT).font("Mono").fontSize(8);
      doc.text(String(i + 1), 0, H - 44, { width: W, align: "center", lineBreak: false });
    }
    doc.end();
  });
}
