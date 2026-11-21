import { isAdmin } from "@/lib/auth";
import { listSubscribers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return new Response("Not signed in", { status: 401 });
  const subs = await listSubscribers();
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  // Guard against spreadsheet formula injection from user-supplied values.
  const safe = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);
  const rows = [
    "email,source,joined,status",
    ...subs.map((s) => [esc(safe(s.email)), esc(s.source), s.created_at, s.unsubscribed_at ? "unsubscribed" : "active"].join(",")),
  ];
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
