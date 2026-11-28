// Only same-site paths, so a link cannot send someone off to another website after signing in.
export function safeNext(raw: unknown, fallback: string): string {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}
