import { Settings, Save, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ClinicSettingsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clinic Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure clinic branding, billing rules, multi-branch preferences, and feature entitlements.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">General Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Clinic Name</label>
              <input
                type="text"
                defaultValue={clinicSlug.replace("-", " ").toUpperCase()}
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tenant Slug</label>
              <input
                type="text"
                disabled
                defaultValue={clinicSlug}
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-bold text-slate-900">Feature Entitlements</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "WhatsApp Automated Billing & Reminders", key: "whatsapp_automations", active: true },
              { label: "Patient Self-Service Portal", key: "patient_portal", active: true },
              { label: "Telehealth Video Consultations", key: "telehealth", active: false },
              { label: "Advanced Financial Analytics", key: "advanced_analytics", active: false },
            ].map((feat) => (
              <div key={feat.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <div className="text-sm font-medium text-slate-800">{feat.label}</div>
                  <div className="text-xs text-slate-400 font-mono">{feat.key}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${feat.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {feat.active ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
