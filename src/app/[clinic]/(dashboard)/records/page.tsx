import { FileText, Plus, Activity, Heart, Thermometer } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RecordsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EMR & Clinical Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured SOAP clinical notes, vitals telemetry, and diagnostic attachments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>New SOAP Consultation</span>
        </button>
      </div>

      {/* Sample EMR Note */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono text-slate-400">PATIENT: Michael Vance (MRN-10024)</div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Clinical Note - Orthopedic Evaluation</h2>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">
            Signed by Dr. Jignesh
          </span>
        </div>

        {/* Vitals Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Pressure
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">120 / 80 mmHg</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-500" /> Pulse Rate
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">72 bpm</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">98.4 &deg;F</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">SpO2</div>
            <div className="text-base font-bold text-slate-800 mt-1">99%</div>
          </div>
        </div>

        {/* SOAP Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200">
            <h3 className="font-bold text-sky-900 mb-1 text-xs uppercase tracking-wider">Subjective (S)</h3>
            <p className="text-slate-600">Patient reports mild bilateral knee stiffness in the morning for the last 3 weeks.</p>
          </div>
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200">
            <h3 className="font-bold text-sky-900 mb-1 text-xs uppercase tracking-wider">Objective (O)</h3>
            <p className="text-slate-600">No swelling observed. Full passive range of motion. Mild tenderness on medial joint line.</p>
          </div>
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200">
            <h3 className="font-bold text-sky-900 mb-1 text-xs uppercase tracking-wider">Assessment (A)</h3>
            <p className="text-slate-600">Early-stage osteoarthritis of right knee.</p>
          </div>
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200">
            <h3 className="font-bold text-sky-900 mb-1 text-xs uppercase tracking-wider">Plan (P)</h3>
            <p className="text-slate-600">Physiotherapy exercises twice daily. Prescribed anti-inflammatory gel. Review in 3 weeks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

