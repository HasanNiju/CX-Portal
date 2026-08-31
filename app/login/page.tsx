import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="min-h-screen bg-navy dark-scope flex">
      {/* Left: brand / manifest panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 border-r border-navy-line relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #E83330 0px, #E83330 1px, transparent 1px, transparent 26px)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="Pathao" width={40} height={40} className="rounded-xl" />
          <span className="font-display text-lg font-semibold text-navy-ink tracking-tight">CX Portal</span>
        </div>

        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-4">Agent workspace · 24/7</p>
          <h1 className="font-display text-5xl leading-[1.05] font-semibold text-navy-ink max-w-md">
            One console for every response, rate, and reply.
          </h1>
          <p className="mt-5 text-navy-ink-soft max-w-sm text-[15px] leading-relaxed">
            Presets, delivery pricing, and an AI assistant — built for the pace of live chat support.
          </p>
        </div>

        <div className="relative flex items-center gap-6 font-mono text-[11px] text-navy-ink-soft">
          <span>ISD · OSD · SUBURB</span>
          <span className="text-navy-line">/</span>
          <span>PRESET BANK</span>
          <span className="text-navy-line">/</span>
          <span>AI ASSISTANT</span>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/logo.png" alt="Pathao" width={36} height={36} className="rounded-xl" />
            <span className="font-display text-lg font-semibold text-navy-ink">CX Portal</span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Sign in</p>
          <h2 className="font-display text-2xl font-semibold text-navy-ink mb-1">Welcome back</h2>
          <p className="text-sm text-navy-ink-soft mb-7">Enter your credentials to open the workspace.</p>
          <LoginForm next={searchParams?.next} />
          <p className="mt-8 text-xs text-navy-ink-soft/70 leading-relaxed">
            Accounts are created by an Admin or Super Admin. If you don't have access yet, contact your
            supervisor for an invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
