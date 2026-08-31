import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shell/TopBar";
import { MobileNav } from "@/components/shell/MobileNav";
import type { Profile } from "@/lib/supabase/types";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={profile as Profile} />
      <main className="mx-auto max-w-7xl px-5 py-8 pb-24 md:pb-8">{children}</main>
      <MobileNav />
    </div>
  );
}
