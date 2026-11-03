/**
 * Pure GST calculation + display helpers (Indian taxation).
 * No DB / server imports — safe in both server actions and client components.
 */

export interface InvoiceLineInput {
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // GST % for this line (0, 5, 12, 18, 28)
}

export interface ComputedLine {
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  taxableValue: number; // line total minus proportional discount share
  taxAmount: number;
}

export interface GstTotals {
  lines: ComputedLine[];
  subtotal: number;
  discountAmount: number;
  taxableValue: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  gstMode: "INTRA" | "INTER";
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Common GST slab rates offered in the line-item editor */
export const GST_SLABS = [0, 5, 12, 18, 28];

/**
 * Computes an Indian GST invoice.
 * - Intra-state supplies: CGST + SGST at half the rate each.
 * - Inter-state supplies (different state / B2B export-style): IGST at full rate.
 * - Invoice-level discount is allocated proportionally across lines.
 */
export function computeGstTotals(
  items: InvoiceLineInput[],
  discount = 0,
  gstMode: "INTRA" | "INTER" = "INTRA"
): GstTotals {
  const subtotal = round2(
    items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
  );

  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const discountShareRatio = subtotal > 0 ? safeDiscount / subtotal : 0;

  const lines: ComputedLine[] = items.map((it) => {
    const lineTotal = round2(it.quantity * it.unitPrice);
    const taxableValue = round2(lineTotal * (1 - discountShareRatio));
    const taxAmount = round2((taxableValue * it.taxRate) / 100);
    return {
      description: it.description,
      hsnCode: it.hsnCode || "",
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxRate: it.taxRate,
      lineTotal,
      taxableValue,
      taxAmount,
    };
  });

  const totalTax = round2(lines.reduce((s, l) => s + l.taxAmount, 0));
  const taxableValue = round2(subtotal - safeDiscount);
  const totalAmount = round2(taxableValue + totalTax);

  return {
    lines,
    subtotal,
    discountAmount: safeDiscount,
    taxableValue,
    totalTax,
    cgst: gstMode === "INTRA" ? round2(totalTax / 2) : 0,
    sgst: gstMode === "INTRA" ? round2(totalTax / 2) : 0,
    igst: gstMode === "INTER" ? totalTax : 0,
    totalAmount,
    gstMode,
  };
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹ formatting as ₹5,445.00 — Indian digit grouping (lakhs) */
export function inr(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return inrFormatter.format(Number.isFinite(n) ? n : 0);
}

/** Digit grouping used by Indian invoices (12,34,567) */
export function formatIndianNumber(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" and ") || "";
}

/** "One Lakh Twenty-Three Thousand..." — Indian (crore/lakh) system */
export function amountInWordsIndian(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "Zero";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero";

  // crore & lakh & thousand spans use 2-digit words; the tail (<1000) is 3-digit
  const spans: { value: number; label: string }[] = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
  ];

  let remaining = rupees;
  const chunks: string[] = [];

  for (const span of spans) {
    const count = Math.floor(remaining / span.value);
    if (count > 0) {
      chunks.push(`${twoDigits(count)} ${span.label}`);
      remaining -= count * span.value;
    }
  }

  if (remaining > 0) {
    chunks.push(threeDigits(remaining));
  }

  const words = chunks.join(" ").replace(/\s+/g, " ").trim();
  const paisePart = paise > 0 ? ` and Paise ${twoDigits(paise)}` : "";
  return `${words}${paisePart}`;
}

export function amountInWordsInvoice(amount: number): string {
  return `Rupees ${amountInWordsIndian(amount)} Only`;
}
