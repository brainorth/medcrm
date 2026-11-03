"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Traditional Post/Redirect/Get login — works on React 18 + Next 14.
 * Errors redirect back to /login?error=...
 */
export async function login(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { email, password } = parsed.data;
  const nextParam = formData.get("next");
  const clinicParam = formData.get("clinic");

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      memberships: {
        where: { isActive: true },
        select: { organization: { select: { slug: true } } },
      },
    },
  });

  // Same generic message for unknown email and wrong password (no account enumeration)
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    redirect(
      typeof clinicParam === "string" && clinicParam
        ? `/${clinicParam}/login?error=${encodeURIComponent("Invalid email or password.")}`
        : `/login?error=${encodeURIComponent("Invalid email or password.")}`
    );
  }

  const activeMemberships = user.memberships;
  if (activeMemberships.length === 0) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Your account has no active clinic membership. Contact your clinic administrator."
      )}`
    );
  }

  // Per-clinic login (/:clinic/login): the signed-in account MUST be a
  // member of that exact clinic — same membership guard as everywhere else.
  let destination: string | null = null;
  if (typeof clinicParam === "string" && clinicParam) {
    const targetMembership = activeMemberships.find(
      (m) => m.organization.slug === clinicParam
    );
    if (!targetMembership) {
      redirect(
        `/${clinicParam}/login?error=${encodeURIComponent(
          "This account does not belong to the selected clinic."
        )}`
      );
    }
    destination = `/${clinicParam}/dashboard`;
  } else if (
    typeof nextParam === "string" &&
    /^\/[a-zA-Z0-9-]+(\/.*)?$/.test(nextParam)
  ) {
    // Honor ?next= only if it's an internal clinic path
    destination = nextParam;
  }
  if (!destination) {
    destination = `/${activeMemberships[0].organization.slug}/dashboard`;
  }

  await setSessionCookie(user.id);
  redirect(destination);
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
