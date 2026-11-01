import { MessageSquare, Send, CheckCheck, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export default function CommunicationsPage({
  params,
}: {
  params: { clinic: string };
}) {
  const clinicSlug = params.clinic;

  const logs = [
    {
      id: "wamid.HBgLMjAyNjExMDE=",
      recipient: "Michael Vance (+15552345678)",
      type: "BILL_INVOICE",
      template: "bill_issued_v1",
      sentAt: "10:15 AM",
      status: "DELIVERED",
      channel: "WhatsApp",
    },
    {
      id: "wamid.HBgLMjAyNjExMDI=",
      recipient: "Sarah Connor (+15554328765)",
      type: "PAYMENT_RECEIPT",
      template: "payment_receipt_v1",
      sentAt: "11:35 AM",
      status: "READ",
      channel: "WhatsApp",
    },
    {
      id: "wamid.HBgLMjAyNjExMDM=",
      recipient: "David Miller (+15559871234)",
      type: "APPOINTMENT_REMINDER",
      template: "appointment_reminder_24h",
      sentAt: "Yesterday 08:00 AM",
      status: "READ",
      channel: "WhatsApp",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">WhatsApp & Communications Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time delivery status, Meta template management, and automated patient communication logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase">Provider Status</div>
          <div className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Meta Cloud API Connected
          </div>
          <div className="text-xs text-slate-500 mt-1">Phone Number ID: 10482910482019</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase">Registered Templates</div>
          <div className="text-xl font-bold text-slate-900 mt-2">4 Active</div>
          <div className="text-xs text-emerald-600 mt-1">100% Meta Quality Rating (Green)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase">Delivery Success Rate</div>
          <div className="text-xl font-bold text-slate-900 mt-2">99.4%</div>
          <div className="text-xs text-slate-500 mt-1">0 webhook failure spikes</div>
        </div>
      </div>

      {/* Message Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Automated Dispatch Log</h2>
          <span className="text-xs text-slate-400 font-mono">Tenant: {clinicSlug}</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">Message Type</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Meta Template</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">External ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-sans font-medium text-slate-900">{log.type}</td>
                  <td className="px-6 py-4 font-sans text-slate-700">{log.recipient}</td>
                  <td className="px-6 py-4 text-sky-600 font-sans">{log.template}</td>
                  <td className="px-6 py-4 text-slate-500 font-sans">{log.sentAt}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans font-medium">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 truncate max-w-[140px]">{log.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

