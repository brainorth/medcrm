import Link from "next/link";
import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/prisma";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

// Already signed in? Skip straight to the first clinic dashboard.
async function redirectIfAuthenticated() {
  const userId = await getSessionUserId();
  if (!userId) return;

  const membership = await db.membership.findFirst({
    where: { userId, isActive: true },
    select: { organization: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    redirect(`/${membership.organization.slug}/dashboard`);
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  await redirectIfAuthenticated();

  const next =
    searchParams.next && /^\/[a-zA-Z0-9-]+(\/.*)?$/.test(searchParams.next)
      ? searchParams.next
      : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Brainorth Med
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Sign in to your clinic workspace
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <LoginForm next={next} error={searchParams.error} />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            ← Back to main site
          </Link>
        </p>
      </div>
    </div>
  );
}
