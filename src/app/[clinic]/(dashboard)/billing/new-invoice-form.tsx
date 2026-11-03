"use client";

import { useMemo, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createInvoice } from "./actions";
import {
  GST_SLABS,
  computeGstTotals,
  inr,
  type InvoiceLineInput,
} from "@/lib/billing/gst";

const inputClass =
  "w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

interface PatientOption {
  id: string;
  label: string; // "MRN-10001 — Michael Vance"
  phone: string;
}

interface AppointmentOption {
  id: string;
  patientId: string;
  label: string; // "Nov 3 — Follow-up"
}

interface ItemRow extends InvoiceLineInput {
  key: number;
}

let rowKey = 0;
const blankItem = (): ItemRow => ({
  key: ++rowKey,
  description: "",
  hsnCode: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
});

export function NewInvoiceForm({
  clinicSlug,
  patients,
  appointments,
  clinicGstin,
  defaultGstMode,
  defaultOpen = false,
}: {
  clinicSlug: string;
  patients: PatientOption[];
  appointments: AppointmentOption[];
  clinicGstin: string | null;
  defaultGstMode: "INTRA" | "INTER";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [patientId, setPatientId] = useState("");
  const [gstMode, setGstMode] = useState<"INTRA" | "INTER">(defaultGstMode);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<ItemRow[]>([blankItem()]);

  const totals = useMemo(() => {
    const valid = items
      .filter((it) => it.description.trim() && it.quantity > 0 && it.unitPrice >= 0)
      .map(({ description, hsnCode, quantity, unitPrice, taxRate }) => ({
        description,
        hsnCode,
        quantity,
        unitPrice,
        taxRate,
      }));
    return computeGstTotals(valid, discount, gstMode);
  }, [items, discount, gstMode]);

  const patientAppointments = appointments.filter(
    (a) => a.patientId === patientId
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>New Invoice</span>
      </button>
    );
  }

  const updateItem = (key: number, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-900">New Tax Invoice</h2>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form action={createInvoice} className="space-y-5">
        <input type="hidden" name="clinicSlug" value={clinicSlug} />

        {/* Patient + appointment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="patientId">Patient *</label>
            <select
              id="patientId"
              name="patientId"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="appointmentId">
              Link appointment (optional)
            </label>
            <select
              id="appointmentId"
              name="appointmentId"
              className={inputClass}
              disabled={patientAppointments.length === 0}
            >
              <option value="">—</option>
              {patientAppointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GST mode */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Supply type</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="gstMode"
                checked={gstMode === "INTRA"}
                onChange={() => setGstMode("INTRA")}
              />
              Intra-State (CGST + SGST)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="gstMode"
                checked={gstMode === "INTER"}
                onChange={() => setGstMode("INTER")}
              />
              Inter-State (IGST)
            </label>
          </div>
          {clinicGstin ? (
            <span className="text-xs text-slate-400 ml-auto">Clinic GSTIN: {clinicGstin}</span>
          ) : (
            <span className="text-xs text-amber-600 ml-auto">
              GSTIN not configured in Settings — invoice will show blank
            </span>
          )}
        </div>

        {/* Line items */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-3 py-2">Service / Item</th>
                <th className="px-3 py-2 w-24">HSN/SAC</th>
                <th className="px-3 py-2 w-16">Qty</th>
                <th className="px-3 py-2 w-28">Rate ₹</th>
                <th className="px-3 py-2 w-24">GST %</th>
                <th className="px-3 py-2 w-28 text-right">Amount</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={it.key}>
                  <td className="px-3 py-2">
                    <input
                      name="itemDescription"
                      required
                      placeholder="e.g. Consultation / ECG / Medicine"
                      value={it.description}
                      onChange={(e) => updateItem(it.key, { description: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="itemHsn"
                      placeholder="HSN/SAC"
                      value={it.hsnCode}
                      onChange={(e) => updateItem(it.key, { hsnCode: e.target.value })}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="itemQuantity"
                      type="number"
                      min={1}
                      required
                      value={it.quantity}
                      onChange={(e) => updateItem(it.key, { quantity: Number(e.target.value) || 0 })}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="itemUnitPrice"
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={it.unitPrice}
                      onChange={(e) => updateItem(it.key, { unitPrice: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      name="itemTaxRate"
                      value={it.taxRate}
                      onChange={(e) => updateItem(it.key, { taxRate: Number(e.target.value) })}
                      className={inputClass}
                    >
                      {GST_SLABS.map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700 font-medium align-middle">
                    {inr(
                      totals.lines[idx]?.lineTotal ?? it.quantity * it.unitPrice
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() => setItems((rows) => rows.filter((r) => r.key !== it.key))}
                      className="text-slate-300 hover:text-red-500 disabled:opacity-30"
                      aria-label="Remove line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 bg-slate-50/60 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setItems((rows) => [...rows, blankItem()])}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              + Add line item
            </button>
          </div>
        </div>

        {/* Totals + discount + due */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="discount">
                  Discount ₹ (whole invoice)
                </label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="dueDate">Payment due date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="patientGstin">
                Patient GSTIN (for B2B patients)
              </label>
              <input
                id="patientGstin"
                name="patientGstin"
                placeholder="e.g. 29ABCDE1234F1Z5"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="notes">Notes (printed on invoice)</label>
              <input id="notes" name="notes" className={inputClass} />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-2 self-start">
            <Row label="Subtotal" value={inr(totals.subtotal)} />
            <Row label="Discount" value={`- ${inr(totals.discountAmount)}`} />
            <Row label="Taxable value" value={inr(totals.taxableValue)} />
            {gstMode === "INTRA" ? (
              <>
                <Row label="CGST" value={inr(totals.cgst)} />
                <Row label="SGST" value={inr(totals.sgst)} />
              </>
            ) : (
              <Row label="IGST" value={inr(totals.igst)} />
            )}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-slate-900 text-base">
                {inr(totals.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <span>{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
