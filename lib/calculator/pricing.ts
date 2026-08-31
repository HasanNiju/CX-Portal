// Delivery-fee pricing engine — ported 1:1 from the previous
// hardcoded calculator logic. Behavior preserved; only the config
// source changed (now Supabase calculator_configs.config_json
// instead of constants baked into index.html).

export type Zone = "ISD" | "OSD" | "Suburb";
export type MerchantType = "new" | "old" | "doc" | "book" | "c2c";
export type DeliveryType = "regular" | "partial" | "reverse" | "sameday";
export type CityType = "same" | "diff";

export interface CalculatorConfigJson {
  codRate: { default: number; docType: number; oldIsdIsd: number };
  sameDay: { zonesAllowed: string[]; baseUpTo1kg: number; extraPerKgAfter1kg: number };
  partialMultiplier: number;
  returnMultiplier: number;
  merchantTables: Record<Exclude<MerchantType, "c2c">, Record<string, number[]>>;
  c2cTable: Record<string, { base: number; extra: number }>;
}

export interface CalcInput {
  merchant: MerchantType;
  from: Zone;
  to: Zone;
  cityType: CityType;
  type: DeliveryType;
  weightKg: number;
  codAmount: number;
  c2cPickup: "home" | "kiosk";
  c2cDelivery: "inside" | "outside";
}

export interface CalcRow {
  label: string;
  amount: number;
}

export interface CalcResult {
  total: number;
  rows: CalcRow[];
  note: string | null;
}

function getTable(cfg: CalculatorConfigJson, merchant: MerchantType) {
  return cfg.merchantTables[merchant as Exclude<MerchantType, "c2c">];
}

function getRow(cfg: CalculatorConfigJson, merchant: MerchantType, f: Zone, t: Zone, cityType: CityType) {
  const tbl = getTable(cfg, merchant);
  const tries = [`${f}-${t}`, `${f}-${t}-${cityType}`, `${t}-${f}`, `${t}-${f}-${cityType}`];
  for (const key of tries) {
    if (tbl[key]) return tbl[key];
  }
  return null;
}

function getCharge(row: number[], w: number) {
  if (w <= 0.5) return row[0];
  if (w <= 1) return row[1];
  if (w <= 2) return row[2];
  return row[2] + Math.ceil(w - 2) * row[3];
}

function codRate(cfg: CalculatorConfigJson, input: CalcInput) {
  if (input.merchant === "doc") return cfg.codRate.docType;
  if (input.merchant === "old" && input.from === "ISD" && input.to === "ISD") return cfg.codRate.oldIsdIsd;
  return cfg.codRate.default;
}

export function calculate(cfg: CalculatorConfigJson, input: CalcInput): CalcResult {
  const w = input.weightKg || 0.5;

  if (input.merchant === "c2c") {
    const key = `${input.c2cPickup}-${input.c2cDelivery}`;
    const entry = cfg.c2cTable[key];
    if (!entry) return { total: 0, rows: [], note: "C2C combination not found." };
    const charge = w <= 1 ? entry.base : entry.base + Math.ceil(w - 1) * entry.extra;
    return {
      total: charge,
      rows: [{ label: "C2C Delivery", amount: charge }],
      note: `C2C: ≤1kg ৳${entry.base} · +৳${entry.extra}/kg after`,
    };
  }

  const rate = codRate(cfg, input);
  const cod = input.codAmount > 0 ? Math.ceil(input.codAmount * rate) : 0;

  if (input.type === "sameday") {
    const key = `${input.from}-${input.to}`;
    if (!cfg.sameDay.zonesAllowed.includes(key)) {
      return { total: 0, rows: [], note: "Same Day delivery is only available for ISD → ISD." };
    }
    const del = w <= 1 ? cfg.sameDay.baseUpTo1kg : cfg.sameDay.baseUpTo1kg + Math.ceil(w - 1) * cfg.sameDay.extraPerKgAfter1kg;
    const rows: CalcRow[] = [{ label: "Same Day Delivery", amount: del }];
    if (cod > 0) rows.push({ label: `COD (${rate === 0.005 ? "0.5%" : "1%"})`, amount: cod });
    return {
      total: del + cod,
      rows,
      note: `Same Day: ISD only · ≤1kg ৳${cfg.sameDay.baseUpTo1kg}, extra ৳${cfg.sameDay.extraPerKgAfter1kg}/kg`,
    };
  }

  const row = getRow(cfg, input.merchant, input.from, input.to, input.cityType);
  if (!row) return { total: 0, rows: [], note: "Zone combination not found for this merchant type." };

  const base = getCharge(row, w);
  let del = base;
  let note: string | null = null;
  if (input.type === "partial") {
    del = Math.round(base * cfg.partialMultiplier);
    note = "Partial/Exchange = delivery + 50% extra.";
  }
  if (input.type === "reverse") note = "Reverse Pickup — no extra charge.";

  const ret = input.type !== "reverse" && input.from !== input.to ? Math.round(base * cfg.returnMultiplier) : 0;

  const rows: CalcRow[] = [{ label: "Delivery", amount: del }];
  if (cod > 0) rows.push({ label: `COD (${rate === 0.005 ? "0.5%" : "1%"})`, amount: cod });
  if (ret > 0) rows.push({ label: "Return (display only)", amount: ret });

  return { total: del + cod, rows, note };
}
