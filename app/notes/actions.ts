"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkNote, checkUsername } from "@/lib/moderation";
import { currentMemberId, endMemberSession, hashPassword, startMemberSession, verifyPassword } from "@/lib/members";
import { addNote, createMember, getMemberById, getMemberByUsername, reportNote, setNoteStatus, storageIsWritable } from "@/lib/store";
import { tooMany } from "@/lib/rateLimit";

export type FormState = { kind: "ok" | "error" | "crisis"; text: string } | null;

const NOTE_MAX = 280;
const PLACE_MAX = 40;
const HIDE_AFTER_REPORTS = 2;

function ip(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : h.get("x-real-ip")) || "unknown";
}

// The signed-in member, if their account is active.
export async function activeMember() {
  const id = currentMemberId();
  if (!id) return null;
  const m = await getMemberById(id);
  return m && m.status === "active" ? m : null;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") || "")) return { kind: "error", text: "Something went wrong. Please try again." };
  if (tooMany(`signup:${ip()}`, 5, 60 * 60 * 1000)) return { kind: "error", text: "Too many new accounts from here. Please try again later." };
  if (!storageIsWritable()) return { kind: "error", text: "Sign-ups are not open just yet. Please try again soon." };

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const problem = checkUsername(username);
  if (problem) return { kind: "error", text: problem };
  if (password.length < 8) return { kind: "error", text: "Please choose a password of at least 8 characters." };
  if (password.length > 200) return { kind: "error", text: "That password is too long." };

  let memberId: string;
  try {
    const m = await createMember(username, hashPassword(password));
    memberId = m.id;
  } catch (err: any) {
    return { kind: "error", text: err?.message === "That username is taken." ? "That username is taken." : "Something went wrong. Please try again." };
  }
  startMemberSession(memberId);
  redirect("/notes#leave-a-note");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (tooMany(`signin:${ip()}`, 10, 15 * 60 * 1000) || tooMany(`signin-user:${username.toLowerCase()}`, 8, 15 * 60 * 1000)) {
    return { kind: "error", text: "Too many tries. Please wait a few minutes." };
  }
  const m = username ? await getMemberByUsername(username) : null;
  if (!m || !verifyPassword(password, m.password_hash)) return { kind: "error", text: "That username and password do not match." };
  if (m.status !== "active") return { kind: "error", text: "This account can no longer post on the wall." };
  startMemberSession(m.id);
  redirect("/notes#leave-a-note");
}

export async function signOut() {
  endMemberSession();
  redirect("/notes");
}

export async function postNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const member = await activeMember();
  if (!member) return { kind: "error", text: "Please sign in to leave a note." };
  if (tooMany(`note:${member.id}`, 5)) return { kind: "error", text: "Please wait a few minutes before leaving another note." };

  const body = String(formData.get("note") || "").replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
  const place = String(formData.get("place") || "").replace(/\s+/g, " ").trim().slice(0, PLACE_MAX);
  const anonymous = formData.get("anonymous") === "on";
  if (body.length < 2) return { kind: "error", text: "Please write a few words first." };

  const check = checkNote(`${body} ${place}`);
  if (check.verdict === "reject") return { kind: "error", text: check.reason };

  const status = check.verdict === "hold" ? "pending" : "approved";
  await addNote({ body, place, member_id: member.id, show_name: !anonymous, status });
  revalidatePath("/notes");

  if (status === "pending") {
    return {
      kind: "crisis",
      text: "Thank you for trusting this wall with something that heavy. It sounds like tonight is really hard, and a wall cannot answer back, so we have kept this note off it. Please reach a person now: call or text 988 (United States), any hour, or text HOME to 741741. If you are in immediate danger, call 911.",
    };
  }
  return { kind: "ok", text: "Your note is on the wall. Thank you for leaving a light on." };
}

export async function reportNoteAction(formData: FormData) {
  const member = await activeMember();
  const noteId = String(formData.get("id") || "");
  if (member && noteId && !tooMany(`report:${member.id}`, 20)) {
    const count = await reportNote(noteId, member.id);
    if (count >= HIDE_AFTER_REPORTS) await setNoteStatus(noteId, "hidden");
    revalidatePath("/notes");
  }
  redirect("/notes?reported=1#wall");
}
