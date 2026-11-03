"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createPatient } from "./actions";

const inputClass =
  "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

export function AddPatientForm({
  clinicSlug,
  defaultOpen = false,
}: {
  clinicSlug: string;
  /** Keep the form open after a validation error redirect */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add New Patient</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-900">New Patient</h2>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form action={createPatient} className="space-y-4">
        <input type="hidden" name="clinicSlug" value={clinicSlug} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="firstName">First name *</label>
            <input id="firstName" name="firstName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="lastName">Last name *</label>
            <input id="lastName" name="lastName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone (WhatsApp) *</label>
            <input id="phone" name="phone" required placeholder="+15551234567" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="gender">Gender</label>
              <select id="gender" name="gender" className={inputClass} defaultValue="">
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="bloodGroup">Blood group</label>
              <select id="bloodGroup" name="bloodGroup" className={inputClass} defaultValue="">
                <option value="">—</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
}
