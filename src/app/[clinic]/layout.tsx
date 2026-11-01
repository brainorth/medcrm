import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
} from "lucide-react";

export default function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const navItems = [
    { label: "Dashboard", href: `/${clinicSlug}/dashboard`, icon: BarChart3 },
    { label: "Patients", href: `/${clinicSlug}/patients`, icon: Users },
    { label: "Appointments", href: `/${clinicSlug}/appointments`, icon: Calendar },
    { label: "EMR / Records", href: `/${clinicSlug}/records`, icon: FileText },
    { label: "Prescriptions (Rx)", href: `/${clinicSlug}/prescriptions`, icon: Pill },
    { label: "Billing & Invoices", href: `/${clinicSlug}/billing`, icon: CreditCard },
    { label: "WhatsApp & Comms", href: `/${clinicSlug}/communications`, icon: MessageSquare },
    { label: "Staff & RBAC", href: `/${clinicSlug}/staff`, icon: ShieldCheck },
    { label: "Clinic Settings", href: `/${clinicSlug}/settings`, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500 rounded-lg text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-none capitalize">
                {clinicSlug.replace("-", " ")}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Brainorth Med Tenant</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Patient Portal Link */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href={`/${clinicSlug}/portal`}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition-colors"
          >
            <span>Patient Portal</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              Workspace: /{clinicSlug}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
              DR
            </div>
            <span className="font-medium">Dr. Jignesh</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

