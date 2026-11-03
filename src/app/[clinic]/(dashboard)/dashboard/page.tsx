import { Users, Calendar, CreditCard, MessageSquare, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ClinicDashboardPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const stats = [
    { title: "Total Patients", value: "1,248", change: "+12% this month", icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Today's Appointments", value: "18", change: "4 in consultation", icon: Calendar, color: "text-amber-600 bg-amber-50" },
    { title: "Monthly Revenue", value: "$24,580", change: "+8% vs last month", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
    { title: "WhatsApp Messages", value: "482", change: "99.4% delivered", icon: MessageSquare, color: "text-sky-600 bg-sky-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {clinicSlug.replace("-", " ")} Clinic Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-tenant overview across clinical and financial operations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mr-1 inline" />
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action & Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Today's Appointment Queue</h2>
          <div className="space-y-3">
            {[
              { time: "09:30 AM", patient: "Michael Vance", mrn: "MRN-10024", doctor: "Dr. Jignesh", status: "In-Consultation", statusClass: "bg-emerald-100 text-emerald-800" },
              { time: "10:00 AM", patient: "Sarah Connor", mrn: "MRN-10025", doctor: "Dr. Jignesh", status: "Checked-In", statusClass: "bg-amber-100 text-amber-800" },
              { time: "10:30 AM", patient: "David Miller", mrn: "MRN-10026", doctor: "Dr. Jignesh", status: "Scheduled", statusClass: "bg-sky-100 text-sky-800" },
            ].map((queue, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium text-slate-600 w-16">{queue.time}</span>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{queue.patient}</div>
                    <div className="text-xs text-slate-500">{queue.mrn} &bull; {queue.doctor}</div>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${queue.statusClass}`}>
                  {queue.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-3">WhatsApp Automation Health</h2>
          <p className="text-xs text-slate-500 mb-4">
            Automated notifications for invoices, appointment reminders & receipts.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-800">Auto-Send Bill Invoices</div>
              <div className="text-xs text-emerald-600 mt-0.5">Active &bull; Triggered on bill generation</div>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
              <div className="text-xs font-semibold text-sky-800">24h Appointment Reminder</div>
              <div className="text-xs text-sky-600 mt-0.5">Active &bull; Scheduled cron</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Digital Prescription Dispatch</div>
              <div className="text-xs text-slate-500 mt-0.5">Active &bull; Triggered on doctor sign-off</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

