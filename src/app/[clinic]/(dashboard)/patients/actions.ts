"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { requireClinicAccess } from "@/lib/auth/guards";

const createPatientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(200)
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
    .optional()
    .or(z.literal("")),
  gender: z.string().trim().max(20).optional().or(z.literal("")),
  bloodGroup: z.string().trim().max(5).optional().or(z.literal("")),
});

async function nextMrn(orgId: string): Promise<string> {
  const last = await db.patient.findFirst({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    select: { mrn: true },
  });

  const lastNum = last?.mrn?.match(/(\d+)$/)?.[1];
  const next = lastNum ? Number(lastNum) + 1 : 10001;
  return `MRN-${next}`;
}

export async function createPatient(formData: FormData): Promise<void> {
  const { tenant } = await requireClinicAccess(formData.get("clinicSlug") as string);

  const parsed = createPatientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    dateOfBirth: formData.get("dateOfBirth") || "",
    gender: formData.get("gender") || "",
    bloodGroup: formData.get("bloodGroup") || "",
  });

  if (!parsed.success) {
    redirect(
      `/${tenant.slug}/patients?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const data = parsed.data;

  try {
    await db.patient.create({
      data: {
        orgId: tenant.id,
        mrn: await nextMrn(tenant.id),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
      },
    });
  } catch (err) {
    console.error("createPatient failed:", err);
    redirect(
      `/${tenant.slug}/patients?error=${encodeURIComponent(
        "Something went wrong while saving the patient."
      )}`
    );
  }

  revalidatePath(`/${tenant.slug}/patients`);
  redirect(`/${tenant.slug}/patients`);
}

export async function deactivatePatient(formData: FormData): Promise<void> {
  const { tenant } = await requireClinicAccess(formData.get("clinicSlug") as string);

  await db.patient.updateMany({
    where: { id: formData.get("patientId") as string, orgId: tenant.id },
    data: { isActive: false },
  });

  revalidatePath(`/${tenant.slug}/patients`);
  redirect(`/${tenant.slug}/patients`);
}
