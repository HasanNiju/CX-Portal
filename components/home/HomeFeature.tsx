import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  library: (
    <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15M6.5 19.5H19M6.5 19.5a2.5 2.5 0 0 1 0-5H19M9 7h6" />
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.4" />
      <line x1="8" y1="7.5" x2="16" y2="7.5" />
      <line x1="8" y1="12" x2="8" y2="12.01" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
      <line x1="16" y1="12" x2="16" y2="12.01" />
      <line x1="8" y1="16" x2="8" y2="16.01" />
      <line x1="12" y1="16" x2="12" y2="16.01" />
      <line x1="16" y1="16" x2="16" y2="17.5" />
    </>
  ),
  sparkles: (
    <path d="M12 3l1.8 4.9L19 9.5l-5.2 1.6L12 16l-1.8-4.9L5 9.5l5.2-1.6L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
  ),
};

export function HomeFeature({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string;
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-card border border-line bg-surface p-5 transition-all hover:border-brand/40 hover:shadow-soft hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-wash text-brand-deep">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[icon]}
          </svg>
        </span>
        {meta && <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{meta}</span>}
      </div>

      <h2 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-soft leading-relaxed flex-1">{description}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        Open
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition-transform group-hover:translate-x-0.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
