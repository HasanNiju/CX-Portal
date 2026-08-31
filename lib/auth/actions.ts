"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/home");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Incorrect email or password." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single();
    if (profile?.status === "disabled") {
      await supabase.auth.signOut();
      return { error: "This account has been disabled. Contact an admin." };
    }
    if (profile?.status === "pending") {
      await supabase.auth.signOut();
      return { error: "This account is pending activation." };
    }
  }

  revalidatePath("/", "layout");
  redirect(next || "/home");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
