import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/supabase/session";
import { TopBar } from "@/components/shell/TopBar";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agents", label: "Agents & Admins" },
  { href: "/admin/presets", label: "Presets" },
];
const SUPER_NAV = [{ href: "/admin/super", label: "Super Admin" }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || profile.role === "agent") redirect("/home");

  const nav = profile.role === "super_admin" ? [...NAV, ...SUPER_NAV] : NAV;

  return (
    <div className="min-h-screen bg-navy dark-scope">
      <TopBar profile={profile as Profile} dark />
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
        <aside className="hidden md:block w-52 shrink-0">
          <p className="px-3 text-[11px] font-mono uppercase tracking-[0.15em] text-navy-ink-soft mb-3">
            {profile.role === "super_admin" ? "Super Admin" : "Admin"}
          </p>
          <nav className="space-y-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring block rounded-lg px-3 py-2 text-sm font-medium text-navy-ink-soft hover:text-navy-ink hover:bg-navy-surface transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
