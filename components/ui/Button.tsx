"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep active:scale-[0.98] shadow-soft",
  secondary: "bg-surface border border-line text-ink hover:border-ink-faint active:scale-[0.98]",
  ghost: "text-ink-soft hover:text-ink hover:bg-sunken active:scale-[0.98]",
  destructive: "bg-bad text-white hover:opacity-90 active:scale-[0.98]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ variant = "primary", className = "", children, ...props }, ref) => (
  <button
    ref={ref}
    className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = "Button";
