"use client";

import { useMemo, useState } from "react";
import { Ticket } from "@/components/ui/Ticket";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { calculate, type CalcInput, type CalculatorConfigJson, type MerchantType, type Zone } from "@/lib/calculator/pricing";

const MERCHANTS: { id: MerchantType; label: string }[] = [
  { id: "new", label: "New" },
  { id: "old", label: "Old" },
  { id: "doc", label: "Document" },
  { id: "book", label: "Bookstore" },
  { id: "c2c", label: "C2C" },
];
const ZONES: Zone[] = ["ISD", "OSD", "Suburb"];
const TYPES: { id: CalcInput["type"]; label: string }[] = [
  { id: "regular", label: "Regular" },
  { id: "partial", label: "Partial" },
  { id: "reverse", label: "Reverse" },
  { id: "sameday", label: "Same Day" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
        active ? "border-brand bg-brand-wash text-brand-deep" : "border-line text-ink-soft hover:border-ink-faint"
      }`}
    >
      {children}
    </button>
  );
}

export function CalculatorWorkspace({ config }: { config: CalculatorConfigJson }) {
  const [merchant, setMerchant] = useState<MerchantType>("new");
  const [from, setFrom] = useState<Zone>("ISD");
  const [to, setTo] = useState<Zone>("ISD");
  const [cityType, setCityType] = useState<CalcInput["cityType"]>("same");
  const [type, setType] = useState<CalcInput["type"]>("regular");
  const [weight, setWeight] = useState(0.5);
  const [cod, setCod] = useState(0);
  const [c2cPickup, setC2cPickup] = useState<CalcInput["c2cPickup"]>("home");
  const [c2cDelivery, setC2cDelivery] = useState<CalcInput["c2cDelivery"]>("inside");
  const toast = useToast();

  const isC2C = merchant === "c2c";
  const showCityRow = from === to && (from === "OSD" || from === "Suburb");

  const result = useMemo(
    () =>
      calculate(config, {
        merchant,
        from,
        to,
        cityType,
        type,
        weightKg: weight,
        codAmount: cod,
        c2cPickup,
        c2cDelivery,
      }),
    [config, merchant, from, to, cityType, type, weight, cod, c2cPickup, c2cDelivery]
  );

  const reset = () => {
    setMerchant("new"); setFrom("ISD"); setTo("ISD"); setCityType("same");
    setType("regular"); setWeight(0.5); setCod(0);
    setC2cPickup("home"); setC2cDelivery("inside");
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(`Estimated delivery charge: ৳${result.total}`);
      toast("Result copied.");
    } catch {
      toast("Couldn't copy — try again.", "bad");
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <div className="space-y-6">
        <section className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Merchant type</p>
          <div className="flex flex-wrap gap-2">
            {MERCHANTS.map((m) => (
              <Chip key={m.id} active={merchant === m.id} onClick={() => setMerchant(m.id)}>{m.label}</Chip>
            ))}
          </div>
        </section>

        {!isC2C ? (
          <>
            <section className="rounded-card border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Zone</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 flex-1">
                  {ZONES.map((z) => <Chip key={z} active={from === z} onClick={() => setFrom(z)}>{z}</Chip>)}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-faint shrink-0"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                <div className="flex gap-1.5 flex-1">
                  {ZONES.map((z) => <Chip key={z} active={to === z} onClick={() => setTo(z)}>{z}</Chip>)}
                </div>
              </div>
              {showCityRow && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">City</p>
                  <div className="flex gap-2">
                    <Chip active={cityType === "same"} onClick={() => setCityType("same")}>Same City</Chip>
                    <Chip active={cityType === "diff"} onClick={() => setCityType("diff")}>Different City</Chip>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Delivery type</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>{t.label}</Chip>)}
              </div>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Weight (kg)</p>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0.1} max={10} step={0.1} value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="flex-1 accent-brand"
                />
                <input
                  type="number" min={0.1} step={0.1} value={weight}
                  onChange={(e) => setWeight(Math.min(parseFloat(e.target.value) || 0.1, 10))}
                  className="focus-ring w-20 rounded-lg border border-line px-2 py-1.5 text-sm font-mono"
                />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">COD amount (৳)</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">৳</span>
                <input
                  type="number" min={0} value={cod || ""}
                  onChange={(e) => setCod(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="focus-ring w-full rounded-lg border border-line py-2 pl-7 pr-3 text-sm font-mono"
                />
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-card border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Pickup</p>
              <div className="flex gap-2">
                <Chip active={c2cPickup === "home"} onClick={() => setC2cPickup("home")}>Home</Chip>
                <Chip active={c2cPickup === "kiosk"} onClick={() => setC2cPickup("kiosk")}>Kiosk</Chip>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Delivery</p>
              <div className="flex gap-2">
                <Chip active={c2cDelivery === "inside"} onClick={() => setC2cDelivery("inside")}>Inside City</Chip>
                <Chip active={c2cDelivery === "outside"} onClick={() => setC2cDelivery("outside")}>Outside City</Chip>
              </div>
            </section>
            <section className="rounded-card border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-3">Weight (kg)</p>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0.1} max={10} step={0.1} value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="flex-1 accent-brand"
                />
                <input
                  type="number" min={0.1} step={0.1} value={weight}
                  onChange={(e) => setWeight(Math.min(parseFloat(e.target.value) || 0.1, 10))}
                  className="focus-ring w-20 rounded-lg border border-line px-2 py-1.5 text-sm font-mono"
                />
              </div>
            </section>
          </>
        )}

        <Button variant="ghost" onClick={reset}>Reset</Button>
      </div>

      {/* Result — sticky on desktop */}
      <div className="lg:sticky lg:top-20">
        <Ticket code="ESTIMATE" dark>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Total charge</p>
          <p className="mt-2 font-display text-5xl font-semibold text-navy-ink tabular-nums">৳{result.total}</p>
          {result.note && <p className="mt-3 text-sm text-navy-ink-soft">{result.note}</p>}

          {result.rows.length > 0 && (
            <div className="mt-6 space-y-2 border-t border-navy-line pt-4">
              {result.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-navy-ink-soft">{r.label}</span>
                  <span className="font-mono text-navy-ink">৳{r.amount}</span>
                </div>
              ))}
            </div>
          )}

          <Button onClick={copyResult} className="mt-6 w-full">Copy result</Button>
        </Ticket>
      </div>
    </div>
  );
}
