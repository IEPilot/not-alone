import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Member accounts for the notes wall. Passwords are never stored, only a salted scrypt hash.
// The sign-in cookie is signed with SESSION_SECRET, the same way the admin login is.

const COOKIE = "nam_member";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set.");
  return s;
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return ["scrypt", salt, hash].join("$");
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(`member:${payload}`).digest("hex");
}

export function startMemberSession(memberId: string) {
  const payload = `${memberId}:${Date.now() + MAX_AGE * 1000}`;
  cookies().set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endMemberSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

// The signed-in member's id, or null. Callers still check that the account is not blocked.
export function currentMemberId(): string | null {
  if (!process.env.SESSION_SECRET) return null;
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const good = sign(payload);
  if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const [id, exp] = payload.split(":");
  if (!id || Number(exp) < Date.now()) return null;
  return id;
}

export function randomTempPassword(): string {
  return randomBytes(6).toString("base64url");
}
