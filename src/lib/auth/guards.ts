import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getTenantBySlug, type TenantContext } from "@/lib/tenant/context";
import { getSessionUserId } from "@/lib/auth/session";
import type { StaffRole } from "@prisma/client";

export interface ClinicAccess {
  tenant: TenantContext;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
  };
  membership: {
    id: string;
    role: StaffRole;
    specialty: string | null;
    permissions: string[];
  };  /** All clinics this user can access — used by the workspace switcher. */
  workspaces: { slug: string; name: string; role: StaffRole }[];
}

/**
 * The single guard every /[clinic]/* page must use.
 *
 * 1. No session            -> redirect to /login (preserving the target page)
 * 2. Unknown clinic slug   -> 404
 * 3. Logged in but NOT an  -> 404 (hides the clinic's existence — a clinic A
 *    active member of that    user who types clinic B's URL gets the same
 *    organization (clinic)    response as a bad URL, no data leak)
 */
export async function requireClinicAccess(
  clinicSlug: string
): Promise<ClinicAccess> {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect(`/login?next=/${clinicSlug}/dashboard`);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      memberships: {
        where: { isActive: true },
        select: {
          id: true,
          role: true,
          specialty: true,
          permissions: true,
          organization: { select: { slug: true, name: true } },
        },
      },
    },
  });

  if (!user) {
    // Session references a deleted user
    redirect(`/login?next=/${clinicSlug}/dashboard`);
  }

  const tenant = await getTenantBySlug(clinicSlug);

  const membership = user.memberships.find(
    (m) => m.organization.slug === tenant.slug
  );

  if (!membership) {
    notFound();
  }

  const workspaces = user.memberships.map((m) => ({
    slug: m.organization.slug,
    name: m.organization.name,
    role: m.role,
  }));

  return {
    tenant,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    },
    membership: {
      id: membership.id,
      role: membership.role,
      specialty: membership.specialty,
      permissions: Array.isArray(membership.permissions)
        ? (membership.permissions as string[])
        : [],
    },
    workspaces,
  };
}
