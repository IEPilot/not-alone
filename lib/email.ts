import "server-only";
import { site } from "@/lib/site";

// Optional email via Resend. If RESEND_API_KEY is not set, these quietly do nothing,
// so the site still works without any email service.

async function send(payload: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
    });
  } catch {
    // Email is a courtesy. Never let it break the signup.
  }
}

export async function sendWelcome(email: string, token: string) {
  const unsub = `${site.url}/unsubscribe/${token}`;
  const text = `Hello, and welcome.

I am glad you are here. This is a quiet list. You will hear from me now and then with a reflection, news about the book, or a small light for a hard night. No pressure, no countdowns.

If tonight is heavy: you are not alone in the hour. If you are in crisis, call or text 988 (United States).

Leave the list any time: ${unsub}

${site.author}
${site.name}`;
  const html = `<div style="background:#111316;padding:32px 16px;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;color:#d6dade;line-height:1.8;font-size:16px;">
    <p style="font-family:monospace;color:#e5a850;letter-spacing:.12em;font-size:12px;text-transform:uppercase;">${site.name}</p>
    <p>Hello, and welcome.</p>
    <p>I am glad you are here. This is a quiet list. You will hear from me now and then with a reflection, news about the book, or a small light for a hard night. No pressure, no countdowns.</p>
    <p>If tonight is heavy: you are not alone in the hour. If you are in crisis, call or text <strong>988</strong> (United States).</p>
    <p style="color:#9aa3ad;font-size:13px;">Leave the list any time: <a style="color:#e5a850;" href="${unsub}">unsubscribe</a></p>
    <p>${site.author}</p>
  </div>
</div>`;
  await send({ to: email, subject: `Welcome to ${site.name}`, html, text });
}

export async function notifyContact(m: { name: string; email: string; message: string }) {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  await send({
    to,
    subject: `New message from ${m.name || "a reader"}`,
    text: `From: ${m.name || "(no name)"} <${m.email || "no email"}>\n\n${m.message}`,
    html: `<p><strong>From:</strong> ${esc(m.name || "(no name)")} ${esc(m.email)}</p><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
    replyTo: m.email || undefined,
  });
}
