"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-2">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(signIn, { error: null } as any);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="next" value={next || "/home"} />
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="you@pathao.com"
            className="focus-ring mt-1.5 w-full rounded-xl border border-navy-line bg-navy px-4 py-3 text-sm text-navy-ink placeholder:text-navy-ink-soft/60"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="focus-ring w-full rounded-xl border border-navy-line bg-navy px-4 py-3 pr-16 text-sm text-navy-ink placeholder:text-navy-ink-soft/60"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-navy-ink-soft hover:text-brand"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {state?.error && (
          <p role="alert" className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm text-brand animate-fade-up">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </div>
    </form>
  );
}
