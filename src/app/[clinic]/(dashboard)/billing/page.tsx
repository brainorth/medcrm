import Link from "next/link";
import { db } from "@/lib/prisma";
import { requireClinicAccess } from "@/lib/auth/guards";
import { hasFeature } from "@/lib/tenant/features";
import { inr } from "@/lib/billing/gst";
import {
  Plus,
  ReceiptIndianRupee,
  Clock3,
  CheckCircle2,
  MessageCircle,
  Eye,
  ArrowDownToLine,
  FileText,
} from "lucide-react";
import { NewInvoiceForm } from "./new-invoice-form";
import { recordPayment, sendBillWhatsApp } from "./actions";
import { InvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ISSUED: "bg-sky-100 text-sky-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
  VOID: "bg-slate-100 text-slate-400 line-through",
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Unpaid",
  PARTIALLY_PAID: "Part Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOID: "Void",
};

const inputClass =
  "w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: { clinic: string };
  searchParams: { status?: string; error?: string };
}) {
  const { tenant } = await requireClinicAccess(params.clinic);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [invoices, collectedThisMonth, outstandingAgg, unpaidCount, patients, recentAppointments, org] =
    await Promise.all([
      db.invoice.findMany({
        where: { orgId: tenant.id },
        orderBy: { createdAt: "desc" },
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true, mrn: true, phone: true },
          },
          payments: { select: { amount: true, method: true, paidAt: true } },
        },
      }),
      db.payment.aggregate({
        where: { orgId: tenant.id, paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.invoice.aggregate({
        where: { orgId: tenant.id, balanceDue: { gt: 0 }, status: { not: "VOID" } },
        _sum: { balanceDue: true },
      }),
      db.invoice.count({
        where: { orgId: tenant.id, balanceDue: { gt: 0 }, status: { not: "VOID" } },
      }),
      db.patient.findMany({
        where: { orgId: tenant.id, isActive: true },
        orderBy: { firstName: "asc" },
        select: { id: true, mrn: true, firstName: true, lastName: true, phone: true },
      }),
      db.appointment.findMany({
        where: { orgId: tenant.id, status: { in: ["COMPLETED", "IN_CONSULTATION"] } },
        orderBy: { startTime: "desc" },
        take: 100,
        select: { id: true, patientId: true, startTime: true, type: true },
      }),
      db.organization.findUniqueOrThrow({
        where: { id: tenant.id },
        select: { gstin: true, stateName: true },
      }),
    ]);

  const whatsappOn = hasFeature(tenant.features, "whatsapp_automations");

  // Filter tabs
  const statusFilter = searchParams.status ?? "all";
  const filtered =
    statusFilter === "unpaid"
      ? invoices.filter((i) => Number(i.balanceDue) > 0.005 && i.status !== "VOID")
      : statusFilter === "paid"
        ? invoices.filter((i) => Number(i.balanceDue) <= 0.005)
        : invoices;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            GST-compliant tax invoices with CGST/SGST/IGST split, payments &amp; WhatsApp billing.
          </p>
        </div>
        <NewInvoiceForm
          clinicSlug={tenant.slug}
          clinicGstin={org.gstin}
          defaultGstMode={org.stateName ? "INTRA" : "INTER"}
          defaultOpen={Boolean(searchParams.error)}
          patients={patients.map((p) => ({
            id: p.id,
            label: `${p.mrn} — ${p.firstName} ${p.lastName}`,
            phone: p.phone,
          }))}
          appointments={recentAppointments.map((a) => ({
            id: a.id,
            patientId: a.patientId,
            label: `${a.startTime.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — ${a.type}`,
          }))}
        />
      </div>

      {searchParams.error ? (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {searchParams.error}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<ReceiptIndianRupee className="w-4 h-4" />}
          tint="bg-emerald-100 text-emerald-700"
          label="Collected this month"
          value={inr(Number(collectedThisMonth._sum.amount ?? 0))}
          hint="All payments received since the 1st"
        />
        <StatCard
          icon={<Clock3 className="w-4 h-4" />}
          tint="bg-amber-100 text-amber-700"
          label="Outstanding dues"
          value={inr(Number(outstandingAgg._sum.balanceDue ?? 0))}
          hint={`${unpaidCount} invoice${unpaidCount === 1 ? "" : "s"} pending`}
        />
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          tint="bg-sky-100 text-sky-700"
          label="Invoices this clinic"
          value={String(invoices.length)}
          hint="All-time total"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "unpaid", label: "Pending payment" },
          { key: "paid", label: "Fully paid" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/${tenant.slug}/billing?status=${tab.key}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              statusFilter === tab.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Invoice table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Issued</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                    No invoices here yet — create the first one with “New Invoice”.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const paid = Number(inv.totalAmount) - Number(inv.balanceDue);
                  const due = Number(inv.balanceDue);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800">
                        <Link
                          href={`/${tenant.slug}/billing/${inv.id}`}
                          className="hover:text-sky-700"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        {inv.gstMode === "INTRA" ? (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            CGST+SGST
                          </span>
                        ) : (
                          <span className="block text-[10px] text-slate-400 font-normal">IGST</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {inv.patient.firstName} {inv.patient.lastName}
                        </span>
                        <span className="block text-[11px] text-slate-400">{inv.patient.mrn}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {inv.createdAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {inr(Number(inv.totalAmount))}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-700">
                        {inr(paid)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {inr(due)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[inv.status]}`}
                        >
                          {STATUS_LABEL[inv.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${tenant.slug}/billing/${inv.id}`}
                            title="View / print invoice"
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {due > 0.005 ? (
                            <details className="relative">
                              <summary
                                title="Collect payment"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors list-none cursor-pointer"
                              >
                                <ArrowDownToLine className="w-4 h-4" />
                              </summary>
                              <form
                                action={recordPayment}
                                className="absolute right-0 z-20 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2"
                              >
                                <input type="hidden" name="clinicSlug" value={tenant.slug} />
                                <input type="hidden" name="invoiceId" value={inv.id} />
                                <p className="text-xs font-semibold text-slate-600">
                                  Collect ₹{due.toFixed(2)} due
                                </p>
                                <input
                                  name="amount"
                                  type="number"
                                  min={0.01}
                                  max={due}
                                  step="0.01"
                                  defaultValue={due}
                                  required
                                  className={inputClass}
                                />
                                <select name="method" defaultValue="CASH" className={inputClass}>
                                  <option value="CASH">Cash</option>
                                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                  <option value="CARD">Card (POS)</option>
                                  <option value="BANK_TRANSFER">Bank transfer / NEFT</option>
                                  <option value="RAZORPAY">Razorpay</option>
                                  <option value="STRIPE">Stripe</option>
                                </select>
                                <input
                                  name="transactionRef"
                                  placeholder="UTR / reference (optional)"
                                  className={inputClass}
                                />
                                <button
                                  type="submit"
                                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                                >
                                  Record Payment
                                </button>
                              </form>
                            </details>
                          ) : null}

                          {whatsappOn && due > 0.005 ? (
                            <form action={sendBillWhatsApp}>
                              <input type="hidden" name="clinicSlug" value={tenant.slug} />
                              <input type="hidden" name="invoiceId" value={inv.id} />
                              <button
                                type="submit"
                                title="Send pending bill on WhatsApp"
                                className="p-1.5 text-emerald-500 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  tint,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${tint}`}>{icon}</div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{hint}</div>
    </div>
  );
}
