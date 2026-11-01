import { Calendar, Plus, Clock, User, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AppointmentsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const appointments = [
    {
      time: "09:30 AM - 10:00 AM",
      patient: "Michael Vance",
      mrn: "MRN-10024",
      doctor: "Dr. Jignesh",
      type: "Consultation",
      status: "In-Consultation",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      time: "10:00 AM - 10:30 AM",
      patient: "Sarah Connor",
      mrn: "MRN-10025",
      doctor: "Dr. Jignesh",
      type: "Follow-up",
      status: "Checked-In",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      time: "10:30 AM - 11:00 AM",
      patient: "David Miller",
      mrn: "MRN-10026",
      doctor: "Dr. Jignesh",
      type: "Routine Check",
      status: "Scheduled",
      statusColor: "bg-sky-100 text-sky-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments & Scheduling</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provider calendar, queue manager, and automated WhatsApp reminder triggers.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Today's Schedule &bull; {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <span className="text-xs bg-sky-50 text-sky-700 font-medium px-2 py-1 rounded border border-sky-200">
            Automated 24h & 2h WhatsApp alerts ON
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {appointments.map((apt, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{apt.time}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{apt.patient}</div>
                  <div className="text-xs text-slate-500">{apt.mrn} &bull; {apt.doctor} &bull; {apt.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.statusColor}`}>
                  {apt.status}
                </span>
                <button className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

