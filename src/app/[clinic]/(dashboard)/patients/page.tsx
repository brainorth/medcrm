import { db } from "@/lib/prisma";
import { requireClinicAccess } from "@/lib/auth/guards";
import { Search, Filter, Ban, RotateCcw } from "lucide-react";
import { AddPatientForm } from "./add-patient-form";
import { deactivatePatient } from "./actions";

export const dynamic = "force-dynamic";

function age(dob: Date | null): string {
  if (!dob) return "—";
  const diff = Date.now() - dob.getTime();
  return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))}`;
}

function lastVisit(dates: { startTime: Date }[]): string {
  if (dates.length === 0) return "No visits";
  const latest = dates
    .map((d) => d.startTime)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  return latest.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: { clinic: string };
  searchParams: { error?: string };
}) {
  const { tenant } = await requireClinicAccess(params.clinic);

  const patients = await db.patient.findMany({
    where: { orgId: tenant.id, isActive: true },
    orderBy: { createdAt: "desc" },
    include: { appointments: { select: { startTime: true } } },
  });

  const inactiveCount = await db.patient.count({
    where: { orgId: tenant.id, isActive: false },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            {patients.length} active patient{patients.length === 1 ? "" : "s"} in {tenant.name}
            {inactiveCount > 0
              ? ` • ${inactiveCount} deactivated`
              : ""}
          </p>
        </div>
        <AddPatientForm clinicSlug={tenant.slug} defaultOpen={Boolean(searchParams.error)} />
      </div>

      {searchParams.error ? (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {searchParams.error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, MRN, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">MRN</th>
                <th className="px-6 py-3">Patient Name</th>
                <th className="px-6 py-3">Demographics</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Last Visit</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No patients yet — click “Add New Patient” to create the first one.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      {p.mrn}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.gender ?? "—"}, {age(p.dateOfBirth)} yrs &bull;{" "}
                      {p.bloodGroup ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{p.phone}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {lastVisit(p.appointments)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={deactivatePatient} className="inline-block">
                        <input type="hidden" name="clinicSlug" value={tenant.slug} />
                        <input type="hidden" name="patientId" value={p.id} />
                        <button
                          type="submit"
                          title="Deactivate patient"
                          className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Ban className="w-4 h-4 inline" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
