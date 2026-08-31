"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface PresetFormState {
  error?: string;
}

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role === "agent") throw new Error("Not authorized.");
  return { supabase, userId: user.id };
}

export async function createPreset(_prev: PresetFormState, formData: FormData): Promise<PresetFormState> {
  const { supabase, userId } = await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!title || !content) return { error: "Title and content are required." };

  const { data, error } = await supabase
    .from("presets")
    .insert({
      title,
      short_description: String(formData.get("short_description") || "").trim() || null,
      content,
      language: String(formData.get("language") || "bn"),
      category_id: String(formData.get("category_id") || "") || null,
      tags: String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Couldn't save the preset. Try again." };

  await supabase.from("audit_logs").insert({ actor_id: userId, action: `Created preset "${title}"`, entity_type: "preset", entity_id: data.id });

  revalidatePath("/admin/presets");
  revalidatePath("/presets");
  redirect("/admin/presets");
}

export async function updatePreset(id: string, _prev: PresetFormState, formData: FormData): Promise<PresetFormState> {
  const { supabase, userId } = await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!title || !content) return { error: "Title and content are required." };

  const { error } = await supabase
    .from("presets")
    .update({
      title,
      short_description: String(formData.get("short_description") || "").trim() || null,
      content,
      language: String(formData.get("language") || "bn"),
      category_id: String(formData.get("category_id") || "") || null,
      tags: String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
      is_active: formData.get("is_active") === "on",
      updated_by: userId,
    })
    .eq("id", id);

  if (error) return { error: "Couldn't save changes. Try again." };

  await supabase.from("audit_logs").insert({ actor_id: userId, action: `Updated preset "${title}"`, entity_type: "preset", entity_id: id });

  revalidatePath("/admin/presets");
  revalidatePath("/presets");
  revalidatePath(`/presets/${id}`);
  redirect("/admin/presets");
}
