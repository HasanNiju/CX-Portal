import { ReactNode } from "react";

// Signature component: a shipment-waybill stub. Used for primary
// action cards, preset cards, and the calculator result. The
// perforated top edge + corner code is a deliberate nod to the
// physical courier tickets this product's users handle all day —
// not a generic dashboard card.
export function Ticket({
  code,
  children,
  className = "",
  dark = false,
  as: As = "div",
}: {
  code?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  as?: any;
}) {
  return (
    <As
      className={`ticket-perf relative rounded-card border pt-6 pb-5 px-5 ${
        dark
          ? "bg-navy-surface border-navy-line dark-scope"
          : "bg-surface border-line"
      } ${className}`}
    >
      {code && (
        <span
          className={`absolute right-4 top-3 font-mono text-[10px] tracking-wider uppercase ${
            dark ? "text-navy-ink-soft" : "text-ink-faint"
          }`}
        >
          {code}
        </span>
      )}
      {children}
    </As>
  );
}
