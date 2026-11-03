import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/session";
import { Stethoscope } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Per-clinic branded login: /:clinic/login
 * - Unknown clinic slug -> 404
 * - Already signed in AND a member of this clinic -> straight to dashboard
 * - Otherwise -> branded login that locks the target clinic
 */
export default async function ClinicLoginPage({
  params,
  searchParams,
}: {
  params: { clinic: string };
  searchParams: { error?: string };
}) {
  const org = await db.organization.findUnique({
    where: { slug: params.clinic },
    select: { name: true, slug: true, logoUrl: true },
  });

  if (!org) notFound();

  // Already logged in?
  const userId = await getSessionUserId();
  if (userId) {
    const ownMembership = await db.membership.findFirst({
      where: { userId, organization: { slug: org.slug }, isActive: true },
    });

    if (ownMembership) {
      redirect(`/${org.slug}/dashboard`);
    }
    // Signed in but not a member of THIS clinic — still allow signing in
    // as a different account (the "not a member" error happens after auth).
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logoUrl}
                alt={org.name}
                className="w-12 h-12 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
            )}
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {org.name}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Staff sign-in for {org.name}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <LoginForm
            next={`/${org.slug}/dashboard`}
            error={searchParams.error}
            clinic={org.slug}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Belong to multiple clinics?{" "}
          <a href="/login" className="text-sky-600 hover:text-sky-800">
            Use the unified login →
          </a>
        </p>
      </div>
    </div>
  );
}
