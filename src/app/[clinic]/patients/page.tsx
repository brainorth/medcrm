import { Users, Plus, Search, Filter, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PatientsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const patients = [
    {
      mrn: "MRN-10024",
      name: "Michael Vance",
      age: "39",
      gender: "Male",
      blood: "O+",
      phone: "+1 (555) 234-5678",
      lastVisit: "Today",
      status: "Active",
    },
    {
      mrn: "MRN-10025",
      name: "Sarah Connor",
      age: "34",
      gender: "Female",
      blood: "A+",
      phone: "+1 (555) 432-8765",
      lastVisit: "Yesterday",
      status: "Active",
    },
    {
      mrn: "MRN-10026",
      name: "David Miller",
      age: "52",
      gender: "Male",
      blood: "B+",
      phone: "+1 (555) 987-1234",
      lastVisit: "Oct 28, 2026",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage patient records, intake history, and dynamic custom field attributes.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

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
              {patients.map((p) => (
                <tr key={p.mrn} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">{p.mrn}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {p.gender}, {p.age} yrs &bull; {p.blood}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{p.phone}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
