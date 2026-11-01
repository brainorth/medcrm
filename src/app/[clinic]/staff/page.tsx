import { ShieldCheck, Plus, UserCheck, Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default function StaffPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const staff = [
    {
      name: "Dr. Jignesh",
      role: "DOCTOR / SUPERADMIN",
      email: "doctor@brainorth.com",
      status: "Active",
      specialty: "Orthopedics",
    },
    {
      name: "Nurse Rachel",
      role: "NURSE",
      email: "rachel@brainorth.com",
      status: "Active",
      specialty: "Clinical Care",
    },
    {
      name: "Alex Morgan",
      role: "RECEPTIONIST",
      email: "reception@brainorth.com",
      status: "Active",
      specialty: "Front Desk & Billing",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff & Role-Based Access Control (RBAC)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage provider profiles, receptionists, billing officers, and granular role permissions.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {staff.map((member, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.email} &bull; {member.specialty}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700">
                  {member.role}
                </span>
                <button className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                  Edit Permissions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
