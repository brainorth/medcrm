import { Pill, Plus, Download, Send, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PrescriptionsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const prescriptions = [
    {
      id: "RX-9082",
      patient: "Michael Vance",
      mrn: "MRN-10024",
      doctor: "Dr. Jignesh",
      date: "Today, 10:15 AM",
      drugs: ["Paracetamol 500mg (1-0-1)", "Aceclofenac Gel (Apply TDS)"],
      status: "DISPATCHED",
    },
    {
      id: "RX-9081",
      patient: "Sarah Connor",
      mrn: "MRN-10025",
      doctor: "Dr. Jignesh",
      date: "Yesterday",
      drugs: ["Amoxicillin 500mg (1-1-1)", "Vitamin C 500mg (1-0-0)"],
      status: "DISPATCHED",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Prescriptions (Rx)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Drug autocomplete, dosage scheduler, PDF generation, and automated WhatsApp delivery.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Prescription</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Recent Prescriptions</h2>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <Send className="w-3 h-3 text-emerald-600" /> WhatsApp Auto-Dispatch Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {rx.id}
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">{rx.patient}</span>
                  <span className="text-xs text-slate-400">({rx.mrn})</span>
                </div>
                <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                  {rx.drugs.map((drug, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-1.5">
                      <Pill className="w-3 h-3 text-sky-500" />
                      <span>{drug}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Prescribed by {rx.doctor} &bull; {rx.date}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-white text-slate-700 rounded-lg text-xs font-medium">
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download PDF</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-medium border border-sky-200">
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Resend WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

