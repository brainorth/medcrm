import Link from "next/link";
import { Stethoscope, Building2, UserCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-sky-600 rounded-xl text-white">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Brainorth Med</h1>
            <p className="text-slate-500 text-sm">Multi-Tenant Doctor & Clinic Management Platform</p>
          </div>
        </div>

        <p className="text-slate-600 mb-8 leading-relaxed">
          Welcome to the Brainorth Med unified workspace. Access clinic provider dashboards or the self-service patient portal using your designated clinic slug.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/apex-clinic/dashboard"
            className="group p-6 rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-sky-50 text-sky-600 rounded">Provider Demo</span>
              </div>
              <h2 className="font-semibold text-slate-800 text-lg">Clinic Workspace</h2>
              <p className="text-sm text-slate-500 mt-1">
                Access patient CRM, appointments, SOAP notes, Rx builder, and automated billing.
              </p>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-sky-600 group-hover:translate-x-1 transition-transform">
              Launch Workspace <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/apex-clinic/portal"
            className="group p-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <UserCircle className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded">Patient Demo</span>
              </div>
              <h2 className="font-semibold text-slate-800 text-lg">Patient Portal</h2>
              <p className="text-sm text-slate-500 mt-1">
                Self-service booking, past prescriptions, and one-click invoice payment via WhatsApp / Web.
              </p>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
              Open Patient Portal <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Brainorth Ecosystem: med.brainorth.com &bull; log.brainorth.com</span>
          <span className="font-mono">Path-based Multi-Tenancy Architecture</span>
        </div>
      </div>
    </main>
  );
}

