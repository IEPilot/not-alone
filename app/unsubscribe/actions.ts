"use server";

import { redirect } from "next/navigation";
import { unsubscribeByToken } from "@/lib/store";

export async function unsubscribeAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const ok = await unsubscribeByToken(token);
  redirect(`/unsubscribe/${encodeURIComponent(token)}?done=${ok ? "1" : "0"}`);
}
