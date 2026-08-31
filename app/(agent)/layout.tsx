import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { TopBar } from "@/components/shell/TopBar";
import { MobileNav } from "@/components/shell/MobileNav";
import type { Profile } from "@/lib/supabase/types";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");

  return (
    <div className="min-h-screen bg-paper">
      <TopBar profile={profile as Profile} />
      <main className="mx-auto max-w-7xl px-5 py-8 pb-24 md:pb-8">{children}</main>
      <MobileNav />
    </div>
  );
}
