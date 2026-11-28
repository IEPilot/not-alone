// Builds the book PDF on request from the chapters stored in the database,
// so the full text never lives in the public code repository.
import "server-only";
import PDFDocument from "pdfkit";
import path from "path";
import { book, site } from "@/lib/site";
import type { BookChapter } from "@/lib/store";

const F = (name: string) => path.join(process.cwd(), "assets", "fonts", name);
const INK = "#1d2126";
const SOFT = "#5b6570";
const AMBER = "#b97d1c"; // readable amber on white
const NIGHT = "#111316";
const GLOW = "#e5a850";

type Run = { text: string; italic: boolean; bold: boolean };

// Inline Markdown the chapters use: **bold**, *italic*, and \_ for a literal underscore.
function runs(s: string): Run[] {
  const out: Run[] = [];
  const parts = s.replace(/\\_/g, "_").split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  for (const p of parts) {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) out.push({ text: p.slice(2, -2), italic: false, bold: true });
    else if (p.startsWith("*") && p.endsWith("*") && p.length > 2) out.push({ text: p.slice(1, -1), italic: true, bold: false });
    else out.push({ text: p, italic: false, bold: false });
  }
  return out;
}

const font = (r: Run) => (r.bold ? (r.italic ? "BoldItalic" : "Bold") : r.italic ? "BodyItalic" : "Body");

// The opening note ("chapter-00-...") is printed before the numbered chapters, without a number.
const isOpeningNote = (slug: string) => slug.startsWith("chapter-00-");

export function buildBookPdf(chapters: BookChapter[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [432, 648], // 6 x 9 inches
      margins: { top: 64, bottom: 72, left: 56, right: 56 },
      bufferPages: true,
      info: { Title: book.title, Author: site.authorFullName, Subject: book.subtitle, Creator: site.publisher },
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
    doc.image(path.join(process.cwd(), "public", "book-cover.jpg"), 0, 0, { cover: [W, H], align: "center", valign: "center" });
    doc.page.margins.bottom = 0;

    /* ----------------------------- front matter -------------------------- */
    doc.addPage();
    doc.page.margins.bottom = 0;
    doc.fillColor(INK).font("Mono").fontSize(8.5).text("ABOUT THIS BOOK", { characterSpacing: 1.5 });
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
      `© ${new Date().getFullYear()} ${site.authorFullName}. Published by ${site.publisher}. For your personal use. Please do not share or resell this file.`,
      56,
      H - 90,
      { width: contentW, lineGap: 3 },
    );

    /* ------------------------------- contents ---------------------------- */
    doc.addPage();
    doc.fillColor(INK).font("Mono").fontSize(8.5).text("CONTENTS", { characterSpacing: 1.5 });
    doc.moveDown(1.2);
    let tocNumber = 0;
    chapters.forEach((c) => {
      const y = doc.y;
      const num = isOpeningNote(c.slug) ? "" : String(++tocNumber).padStart(2, "0");
      doc.fillColor(AMBER).font("Mono").fontSize(8.5).text(num, 56, y + 1.5, { width: 28, lineBreak: false });
      doc.fillColor(INK).font("Body").fontSize(10.5).text(c.title, 90, y, { width: contentW - 34, lineGap: 2 });
      doc.moveDown(0.55);
    });

    /* ------------------------------- chapters ---------------------------- */
    const paragraph = (text: string, x: number, width: number) => {
      const rs = runs(text.replace(/\n/g, " "));
      rs.forEach((r, idx) => {
        doc.fillColor(INK).font(font(r)).fontSize(10.5);
        doc.text(r.text, idx === 0 ? x : undefined, idx === 0 ? doc.y : undefined, {
          width,
          lineGap: 4.5,
          continued: idx < rs.length - 1,
        });
      });
    };

    let chapterNumber = 0;
    chapters.forEach((c) => {
      doc.addPage();
      const label = isOpeningNote(c.slug) ? "BEFORE WE BEGIN" : `CHAPTER ${String(++chapterNumber).padStart(2, "0")}`;
      doc.fillColor(AMBER).font("Mono").fontSize(8.5).text(label, 56, 96, { characterSpacing: 2 });
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
        } else if (t.startsWith("## ")) {
          // Section heading inside a chapter; start a new page rather than strand it at the bottom.
          if (doc.y > H - 150) doc.addPage();
          else doc.moveDown(0.6);
          doc.fillColor(INK).font("Bold").fontSize(13).text(t.slice(3).trim(), 56, doc.y, { width: contentW, lineGap: 3 });
          doc.moveDown(0.7);
        } else if (t.split("\n").every((l) => /^(- |\d+\. )/.test(l))) {
          // A bulleted or numbered list: one item per line.
          for (const line of t.split("\n")) {
            const m = line.match(/^(- |(\d+)\. )(.*)$/)!;
            if (doc.y > H - 100) doc.addPage();
            const y = doc.y;
            doc.fillColor(AMBER).font("Mono").fontSize(10).text(m[2] ? `${m[2]}.` : "•", 60, y, { width: 16, lineBreak: false });
            doc.y = y;
            paragraph(m[3], 78, contentW - 22);
            doc.moveDown(0.35);
          }
          doc.x = 56;
          doc.moveDown(0.55);
        } else {
          paragraph(t, 56, contentW);
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
