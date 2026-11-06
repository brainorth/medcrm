"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowRight, ShieldCheck, Building2, Lock } from "lucide-react";

export default function HomePage() {
  const [clinicSlug, setClinicSlug] = useState("");
  const router = useRouter();

  const handleClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = clinicSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (cleanSlug) {
      router.push(`/${cleanSlug}/dashboard`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10 text-center">
        {/* Logo & Brand */}
        <div className="inline-flex items-center justify-center p-3 bg-sky-500 rounded-2xl text-white shadow-md mb-5">
          <Stethoscope className="w-8 h-8" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Brainorth Med
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Multi-Tenant Doctor & Clinic Management Platform
        </p>

        {/* Primary Message as Requested */}
        <div className="mt-6 p-4 rounded-xl bg-sky-50/80 border border-sky-100 text-sky-950">
          <div className="flex items-center justify-center gap-2 font-semibold text-sm">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>Please login using your respective clinic link</span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Each clinic workspace is private and secured to its designated URL format:
            <br />
            <code className="text-sky-700 font-mono font-medium">med.brainorth.com/:clinic-slug/dashboard</code>
          </p>
        </div>

        {/* Clinic Jump Box */}
        <form onSubmit={handleClinicSubmit} className="mt-6 text-left">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Enter Your Clinic Slug
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono select-none">
                med.brainorth.com/
              </span>
              <input
                type="text"
                placeholder="your-clinic"
                value={clinicSlug}
                onChange={(e) => setClinicSlug(e.target.value)}
                className="w-full pl-[140px] pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!clinicSlug.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Go</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Example: <button type="button" onClick={() => setClinicSlug("demo-clinic")} className="text-sky-600 hover:underline">demo-clinic</button> or <button type="button" onClick={() => setClinicSlug("brainorth-dental")} className="text-sky-600 hover:underline">brainorth-dental</button>
          </p>
        </form>

        {/* Central Sign-in Option */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Staff Central Sign In</span>
          </Link>

          <Link
            href="https://brainorth.com"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Back to Brainorth Corporate Website
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Multi-Tenant Medical Cloud</span>
        </div>
      </div>
    </main>
  );
}
