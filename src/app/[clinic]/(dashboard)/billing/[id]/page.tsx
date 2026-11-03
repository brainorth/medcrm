import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { requireClinicAccess } from "@/lib/auth/guards";
import { hasFeature } from "@/lib/tenant/features";
import {
  inr,
  formatIndianNumber,
  amountInWordsInvoice,
  type ComputedLine,
} from "@/lib/billing/gst";
import { ArrowLeft, MessageCircle, CheckCircle2 } from "lucide-react";
import { PrintButton } from "./print-button";
import { recordPayment, sendBillWhatsApp } from "../actions";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card (POS)",
  BANK_TRANSFER: "Bank Transfer / NEFT",
  RAZORPAY: "Razorpay",
  STRIPE: "Stripe",
};

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { clinic: string; id: string };
}) {
  const { tenant } = await requireClinicAccess(params.clinic);

  const invoice = await db.invoice.findFirst({
    where: { id: params.id, orgId: tenant.id },
    include: {
      patient: true,
      payments: { orderBy: { paidAt: "asc" } },
      appointment: { select: { startTime: true, type: true } },
    },
  });

  if (!invoice) notFound();

  const org = await db.organization.findUniqueOrThrow({
    where: { id: tenant.id },
    select: {
      name: true,
      address: true,
      phone: true,
      email: true,
      gstin: true,
      stateName: true,
      logoUrl: true,
    },
  });

  const lines = (invoice.items as unknown as ComputedLine[]) ?? [];
  const due = Number(invoice.balanceDue);
  const paid = Number(invoice.totalAmount) - due;
  const whatsappOn = hasFeature(tenant.features, "whatsapp_automations");

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Toolbar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/${tenant.slug}/billing`}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <div className="flex items-center gap-3">
          {whatsappOn && due > 0.005 ? (
            <form action={sendBillWhatsApp}>
              <input type="hidden" name="clinicSlug" value={tenant.slug} />
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send on WhatsApp</span>
              </button>
            </form>
          ) : null}
          <PrintButton />
        </div>
      </div>

      {/* ----------------------- PRINTABLE GST INVOICE ----------------------- */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 print:border-0 print:shadow-none print:rounded-none">
        {/* Header: clinic identity */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-3">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt={org.name} className="w-14 h-14 rounded-lg object-cover" />
            ) : null}
            <div>
              <h1 className="text-xl font-bold text-slate-900">{org.name}</h1>
              {org.address ? (
                <p className="text-xs text-slate-500 whitespace-pre-line mt-1">{org.address}</p>
              ) : null}
              <p className="text-xs text-slate-500 mt-1">
                {org.phone ? `Ph: ${org.phone}` : ""}
                {org.email ? ` • ${org.email}` : ""}
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                GSTIN: {invoice.clinicGstin || "—"}
                {org.stateName ? ` • State: ${org.stateName}` : ""}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="inline-block px-3 py-1 rounded-md bg-sky-50 border border-sky-100 text-sky-800 font-bold tracking-wide text-sm">
              TAX INVOICE
            </div>
            <p className="font-mono font-semibold text-slate-900 mt-2">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500 mt-1">
              Date:{" "}
              {invoice.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            {invoice.dueDate ? (
              <p className="text-xs text-slate-500">
                Due:{" "}
                {invoice.dueDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
        </div>

        {/* Billed to */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
              Billed To
            </p>
            <p className="font-semibold text-slate-900">
              {invoice.patient.firstName} {invoice.patient.lastName}
            </p>
            <p className="text-xs text-slate-500">
              MRN: {invoice.patient.mrn} • Ph: {invoice.patient.phone}
            </p>
            {invoice.patientGstin ? (
              <p className="text-xs text-slate-500">Patient GSTIN: {invoice.patientGstin}</p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
              Place of Supply
            </p>
            <p className="text-sm text-slate-700">
              {invoice.placeOfSupply || org.stateName || "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supply type:{" "}
              {invoice.gstMode === "INTRA"
                ? "Intra-State (CGST + SGST)"
                : "Inter-State (IGST)"}
            </p>
            {invoice.appointment ? (
              <p className="text-xs text-slate-500">
                Visit:{" "}
                {invoice.appointment.startTime.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                — {invoice.appointment.type}
              </p>
            ) : null}
          </div>
        </div>

        {/* Line items */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Service / Item</th>
                <th className="px-3 py-2">HSN/SAC</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Taxable</th>
                <th className="px-3 py-2 text-center">GST %</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2">{l.description}</td>
                  <td className="px-3 py-2 font-mono text-xs">{l.hsnCode || "—"}</td>
                  <td className="px-3 py-2 text-right">{l.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatIndianNumber(l.unitPrice)}</td>
                  <td className="px-3 py-2 text-right">{formatIndianNumber(l.taxableValue)}</td>
                  <td className="px-3 py-2 text-center">{l.taxRate}%</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900">
                    {formatIndianNumber(l.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + GST summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
              GST Summary
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
              <table className="w-full text-center">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-semibold">
                  <tr>
                    <th className="px-2 py-1.5">Taxable</th>
                    <th className="px-2 py-1.5">CGST</th>
                    <th className="px-2 py-1.5">SGST</th>
                    <th className="px-2 py-1.5">IGST</th>
                    <th className="px-2 py-1.5">Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 font-medium">
                      {formatIndianNumber(Number(invoice.subtotal) - Number(invoice.discountAmount))}
                    </td>
                    <td className="px-2 py-2">{formatIndianNumber(Number(invoice.cgstAmount))}</td>
                    <td className="px-2 py-2">{formatIndianNumber(Number(invoice.sgstAmount))}</td>
                    <td className="px-2 py-2">{formatIndianNumber(Number(invoice.igstAmount))}</td>
                    <td className="px-2 py-2">{formatIndianNumber(Number(invoice.taxAmount))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {invoice.notes ? (
              <p className="text-xs text-slate-500 mt-3">Note: {invoice.notes}</p>
            ) : null}
          </div>

          <div className="ml-auto w-full sm:max-w-xs text-sm space-y-1.5">
            <TotalRow label="Subtotal" value={formatIndianNumber(Number(invoice.subtotal))} />
            {Number(invoice.discountAmount) > 0 ? (
              <TotalRow
                label="Discount"
                value={`- ${formatIndianNumber(Number(invoice.discountAmount))}`}
              />
            ) : null}
            {invoice.gstMode === "INTRA" ? (
              <>
                <TotalRow label="CGST" value={formatIndianNumber(Number(invoice.cgstAmount))} />
                <TotalRow label="SGST" value={formatIndianNumber(Number(invoice.sgstAmount))} />
              </>
            ) : (
              <TotalRow label="IGST" value={formatIndianNumber(Number(invoice.igstAmount))} />
            )}
            <div className="border-t border-slate-300 pt-2 mt-2">
              <TotalRow
                label="Grand Total"
                value={inr(Number(invoice.totalAmount))}
                bold
              />
            </div>
            <TotalRow label="Amount Paid" value={inr(paid)} />
            <div className="border-t border-slate-200 pt-2">
              <TotalRow label="Balance Due" value={inr(due)} bold />
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <p className="text-sm text-slate-700 border-t border-slate-200 pt-4">
          <span className="font-semibold">Amount in words: </span>
          {amountInWordsInvoice(Number(invoice.totalAmount))}
        </p>

        {/* Payments history */}
        {invoice.payments.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
              Payment Receipts
            </p>
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-[10px] uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="py-1">Receipt #</th>
                  <th className="py-1">Date</th>
                  <th className="py-1">Method</th>
                  <th className="py-1">Reference</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 font-mono text-xs">{p.receiptNumber}</td>
                    <td className="py-2 text-xs">
                      {p.paidAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 text-xs">{METHOD_LABEL[p.method] ?? p.method}</td>
                    <td className="py-2 text-xs text-slate-400">{p.transactionRef || "—"}</td>
                    <td className="py-2 text-right font-medium">{inr(Number(p.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-6">
          <p className="text-[11px] text-slate-400 max-w-xs">
            This is a computer-generated tax invoice issued under the clinic&apos;s GST
            registration. Healthcare services may be GST-exempt as applicable; tax is
            charged only on lines with a non-zero rate.
          </p>
          <div className="text-center">
            {Number(invoice.balanceDue) <= 0.005 ? (
              <p className="text-emerald-700 text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> PAID IN FULL
              </p>
            ) : (
              <p className="text-amber-700 text-sm font-semibold">Balance Due: {inr(due)}</p>
            )}
            <div className="mt-8 border-t border-slate-300 pt-1 w-48">
              <span className="text-[10px] text-slate-400">Authorised Signatory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick collect (screen only) */}
      {due > 0.005 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 print:hidden">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Collect Payment</h3>
          <form action={recordPayment} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="clinicSlug" value={tenant.slug} />
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <label className="text-xs font-semibold text-slate-600">
              Amount ₹
              <input
                name="amount"
                type="number"
                min={0.01}
                max={due}
                step="0.01"
                defaultValue={due}
                required
                className={`${inputClass} mt-1 block w-32`}
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Method
              <select name="method" defaultValue="CASH" className={`${inputClass} mt-1 block w-52`}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CARD">Card (POS)</option>
                <option value="BANK_TRANSFER">Bank transfer / NEFT</option>
                <option value="RAZORPAY">Razorpay</option>
                <option value="STRIPE">Stripe</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              UTR / Reference
              <input
                name="transactionRef"
                placeholder="optional"
                className={`${inputClass} mt-1 block w-52`}
              />
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
            >
              Record Payment
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-slate-900" : "text-slate-600"}`}>
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );
}

const inputClass =
  "px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500";
