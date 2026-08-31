"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth/actions";
import type { Profile } from "@/lib/supabase/types";

const AGENT_NAV = [
  { href: "/home", label: "Home" },
  { href: "/presets", label: "Presets" },
  { href: "/calculator", label: "Calculator" },
  { href: "/assistant", label: "Assistant" },
];

export function TopBar({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur ${
        dark ? "bg-navy/90 border-navy-line" : "bg-paper/90 border-line"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3">
        <Link href="/home" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="Pathao" width={30} height={30} className="rounded-lg" />
          <span className={`font-display font-semibold tracking-tight ${dark ? "text-navy-ink" : "text-ink"}`}>
            CX Portal
          </span>
        </Link>

        {!isAdminArea && (
          <nav className="hidden md:flex items-center gap-1">
            {AGENT_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-brand"
                      : dark
                      ? "text-navy-ink-soft hover:text-navy-ink"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />

        {(profile.role === "admin" || profile.role === "super_admin") && (
          <Link
            href={isAdminArea ? "/home" : "/admin"}
            className={`focus-ring hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              dark ? "border-navy-line text-navy-ink-soft hover:text-brand" : "border-line text-ink-soft hover:text-brand"
            }`}
          >
            {isAdminArea ? "Agent view" : "Admin"}
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className={`focus-ring flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium ${
              dark ? "border-navy-line text-navy-ink" : "border-line text-ink"
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              {profile.full_name?.[0]?.toUpperCase() || "?"}
            </span>
            <span className="hidden sm:inline">{profile.full_name?.split(" ")[0]}</span>
          </button>
          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-xl border p-1 shadow-soft animate-pop ${
                dark ? "bg-navy-surface border-navy-line" : "bg-surface border-line"
              }`}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className={`px-3 py-2 text-xs ${dark ? "text-navy-ink-soft" : "text-ink-faint"}`}>
                <p className={`font-semibold ${dark ? "text-navy-ink" : "text-ink"}`}>{profile.full_name}</p>
                <p className="truncate">{profile.email}</p>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className={`focus-ring w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    dark ? "text-navy-ink hover:bg-navy" : "text-ink hover:bg-sunken"
                  }`}
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
