import { login } from "./actions";

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

export function LoginForm({
  next,
  error,
  clinic,
}: {
  next: string | null;
  error?: string;
  /** When set, the user must be a member of this specific clinic after login. */
  clinic?: string;
}) {
  return (
    <form action={login} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      {clinic ? <input type="hidden" name="clinic" value={clinic} /> : null}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="doctor@clinic.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {error ? (
        <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        Sign In
      </button>
    </form>
  );
}
