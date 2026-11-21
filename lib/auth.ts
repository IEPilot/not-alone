import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "nam_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()!).update(payload).digest("hex");
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(input, real);
}

export function startSession() {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = String(expires);
  cookies().set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function isAdmin(): boolean {
  if (!adminConfigured()) return false;
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now();
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error("Not signed in.");
}
