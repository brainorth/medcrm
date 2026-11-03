import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  ChevronDown,
  Building2,
  LogOut,
  BarChart3,
} from "lucide-react";
import { requireClinicAccess } from "@/lib/auth/guards";
import { logout } from "@/app/login/actions";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clinic: string };
}) {
  // Every /[clinic]/* route passes through this single guard:
  // valid session + active Membership in THIS organization, or 404.
  const { tenant, user, membership, workspaces } = await requireClinicAccess(
    params.clinic
  );

  const navItems = [
    { label: "Dashboard", href: `/${tenant.slug}/dashboard`, icon: BarChart3 },
    { label: "Patients", href: `/${tenant.slug}/patients`, icon: Users },
    { label: "Appointments", href: `/${tenant.slug}/appointments`, icon: Calendar },
    { label: "EMR / Records", href: `/${tenant.slug}/records`, icon: FileText },
    { label: "Prescriptions (Rx)", href: `/${tenant.slug}/prescriptions`, icon: Pill },
    { label: "Billing & Invoices", href: `/${tenant.slug}/billing`, icon: CreditCard },
    { label: "WhatsApp & Comms", href: `/${tenant.slug}/communications`, icon: MessageSquare },
    { label: "Staff & RBAC", href: `/${tenant.slug}/staff`, icon: ShieldCheck },
    { label: "Clinic Settings", href: `/${tenant.slug}/settings`, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        {/* Clinic / workspace switcher */}
        <details className="group">
          <summary className="p-5 border-b border-slate-800 flex items-center justify-between cursor-pointer list-none hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500 rounded-lg text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-none">
                  {tenant.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  /{tenant.slug}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="border-b border-slate-800 p-2 space-y-1">
            <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
              Switch workspace
            </div>
            {workspaces.map((ws) => (
              <Link
                key={ws.slug}
                href={`/${ws.slug}/dashboard`}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                  ws.slug === tenant.slug
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="flex-1 truncate">{ws.name}</span>
                <span className="text-[10px] font-semibold text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                  {ws.role.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        </details>

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
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href={`/${tenant.slug}/portal`}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition-colors"
          >
            <span>Patient Portal</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              Workspace: /{tenant.slug}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {membership.role.replace("_", " ")}
              {membership.specialty ? ` • ${membership.specialty}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden md:block text-slate-500">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                initials(user.fullName)
              )}
            </div>
            <span className="font-medium">{user.fullName}</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
