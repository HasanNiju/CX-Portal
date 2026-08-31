export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "brand";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-sunken text-ink-soft border-line",
    good: "bg-[#E7F4EC] text-good border-[#BFE3CC]",
    warn: "bg-[#FBF1DE] text-warn border-[#EFDBAC]",
    bad: "bg-brand-wash text-bad border-[#F5C6C3]",
    brand: "bg-brand-wash text-brand-deep border-[#F5C6C3]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
