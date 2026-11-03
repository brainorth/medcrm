import Link from "next/link";
import { Download, CreditCard, Calendar, FileText, CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PatientPortalPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Patient Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-600 rounded-lg text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg capitalize">{clinicSlug.replace("-", " ")}</div>
              <div className="text-xs text-slate-500">Secure Patient Self-Service Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted HIPAA/GDPR Portal</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-6 space-y-6">
        {/* Patient Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-200">Welcome Back</div>
            <h1 className="text-2xl font-bold mt-1">Michael Vance</h1>
            <p className="text-sky-100 text-sm mt-0.5">MRN: MRN-10024 &bull; DOB: 14 Oct 1985</p>
          </div>
          <button className="px-4 py-2 bg-white text-sky-700 rounded-lg text-sm font-semibold hover:bg-sky-50 transition-colors shadow">
            Book New Appointment
          </button>
        </div>

        {/* Outstanding / Recent Invoice (from WhatsApp link) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-sky-600 uppercase">Latest Invoice from Clinic</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Invoice #INV-2026-001</h2>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-semibold rounded-full">
              Payment Due
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-sm text-slate-600">Consultation + X-Ray Knee</div>
              <div className="text-xs text-slate-400 mt-0.5">Issued: Today &bull; Dr. Jignesh</div>
              <div className="text-2xl font-bold text-slate-900 mt-2">$150.00</div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                <CreditCard className="w-4 h-4" />
                <span>Pay $150.00 (UPI / Card)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Past Prescriptions & Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-3">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Digital Prescriptions</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">Orthopedic Rx - Knee Care</div>
                  <div className="text-xs text-slate-500">Dr. Jignesh &bull; 3 Medications</div>
                </div>
                <button className="text-xs font-semibold text-sky-600 hover:underline">
                  View Rx
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-3">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Appointment History</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">Routine Check-Up</div>
                  <div className="text-xs text-slate-500">Today, 09:30 AM &bull; Completed</div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

