"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/presets", label: "Presets" },
  { href: "/calculator", label: "Calc" },
  { href: "/assistant", label: "Assistant" },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                active ? "text-brand" : "text-ink-faint"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-brand" : "bg-transparent"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
