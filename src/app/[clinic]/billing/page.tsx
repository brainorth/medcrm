import { Plus, CreditCard, Send, CheckCircle2, Clock } from "lucide-react";

export default function BillingPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const invoices = [
    {
      id: "INV-2026-001",
      patient: "Michael Vance",
      phone: "+1 (555) 234-5678",
      date: "Today, 10:15 AM",
      items: "Consultation + X-Ray Knee",
      total: "$150.00",
      status: "ISSUED",
      whatsappStatus: "DELIVERED",
    },
    {
      id: "INV-2026-002",
      patient: "Sarah Connor",
      phone: "+1 (555) 432-8765",
      date: "Today, 11:30 AM",
      items: "Consultation & Routine Lab Panel",
      total: "$220.00",
      status: "PAID",
      whatsappStatus: "READ",
    },
    {
      id: "INV-2026-003",
      patient: "David Miller",
      phone: "+1 (555) 987-1234",
      date: "Yesterday",
      items: "Follow-up & Medication Refill",
      total: "$65.00",
      status: "ISSUED",
      whatsappStatus: "SENT",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Automated Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Itemized invoices, automatic WhatsApp bill delivery, and multi-channel payment tracking.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* WhatsApp Automated Flow Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-sky-950">
              WhatsApp Instant Bill Dispatch is ACTIVE
            </div>
            <div className="text-xs text-sky-700">
              When an invoice is issued, an itemized PDF copy and payment link are automatically dispatched to the patient's verified WhatsApp number.
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-300">
          Template: bill_issued_v1
        </span>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Recent Invoices</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CreditCard className="w-4 h-4" />
            <span>Multi-Tenant Currency: USD ($)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Patient & Phone</th>
                <th className="px-6 py-3">Services</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3">WhatsApp Dispatch</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{inv.patient}</div>
                    <div className="text-xs text-slate-500">{inv.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{inv.items}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{inv.total}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        inv.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {inv.whatsappStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                      Resend WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

