"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { requireClinicAccess } from "@/lib/auth/guards";
import { hasFeature } from "@/lib/tenant/features";
import { sendAutomatedBillWhatsApp } from "@/lib/whatsapp/client";
import { computeGstTotals } from "@/lib/billing/gst";

const lineSchema = z.object({
  description: z.string().trim().min(1, "Every line item needs a description").max(200),
  hsnCode: z.string().trim().max(10).optional().default(""),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(1000),
  unitPrice: z.coerce.number().min(0).max(10000000),
  taxRate: z.coerce.number().min(0).max(28),
});

const createInvoiceSchema = z.object({
  patientId: z.string().uuid("Select a patient"),
  appointmentId: z.string().uuid().optional().or(z.literal("")),
  gstMode: z.enum(["INTRA", "INTER"]).default("INTRA"),
  patientGstin: z.string().trim().max(15).optional().or(z.literal("")),
  discount: z.coerce.number().min(0).max(10000000).default(0),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid due date")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Parallel array inputs served by the line-item editor */
const descs = z.string().trim().min(1).max(200);
const hsns = z.string().trim().max(10).optional().default("");

async function nextInvoiceNumber(
  orgId: string,
  invoicePrefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const count = await db.invoice.count({
    where: { orgId, createdAt: { gte: yearStart } },
  });
  return `${invoicePrefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(formData: FormData): Promise<void> {
  const { tenant } = await requireClinicAccess(formData.get("clinicSlug") as string);

  const org = await db.organization.findUniqueOrThrow({
    where: { id: tenant.id },
    select: { invoicePrefix: true, gstin: true, stateName: true },
  });

  // ---- validate scalar fields -------------------------------------------------
  const parsed = createInvoiceSchema.safeParse({
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId") || "",
    gstMode: formData.get("gstMode") || "INTRA",
    patientGstin: formData.get("patientGstin") || "",
    discount: formData.get("discount") || 0,
    dueDate: formData.get("dueDate") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  // ---- validate line items (parallel arrays) ----------------------------------
  const rawDescs = formData.getAll("itemDescription").map(String);
  const rawHsns = formData.getAll("itemHsn").map(String);
  const rawQty = formData.getAll("itemQuantity").map(String);
  const rawUnit = formData.getAll("itemUnitPrice").map(String);
  const rawTax = formData.getAll("itemTaxRate").map(String);

  if (rawDescs.length === 0) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Add at least one line item.")}`);
  }

  const lines = rawDescs.map((_, i) =>
    lineSchema.safeParse({
      description: rawDescs[i],
      hsnCode: (rawHsns[i] ?? "").trim(),
      quantity: rawQty[i],
      unitPrice: rawUnit[i],
      taxRate: rawTax[i],
    })
  );

  const bad = lines.find((l) => !l.success);
  if (bad && !bad.success) {
    redirect(
      `/${tenant.slug}/billing?error=${encodeURIComponent(bad.error.issues[0].message)}`
    );
  }

  const items = (lines as { success: true; data: z.infer<typeof lineSchema> }[]).map(
    (l) => l.data
  );

  // ---- patient must belong to this clinic (tenant isolation) ------------------
  const patient = await db.patient.findFirst({
    where: { id: parsed.data.patientId, orgId: tenant.id, isActive: true },
    select: { id: true, firstName: true, lastName: true, phone: true },
  });

  if (!patient) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Patient not found in this clinic.")}`);
  }

  const totals = computeGstTotals(items, parsed.data.discount, parsed.data.gstMode);

  let created;
  try {
    created = await db.invoice.create({
      data: {
        orgId: tenant.id,
        patientId: patient.id,
        appointmentId: parsed.data.appointmentId || null,
        invoiceNumber: await nextInvoiceNumber(tenant.id, org.invoicePrefix),
        items: totals.lines as unknown as object,
        gstMode: totals.gstMode,
        placeOfSupply: parsed.data.gstMode === "INTRA" ? org.stateName : null,
        clinicGstin: org.gstin ?? null,
        patientGstin: parsed.data.patientGstin || null,
        cgstAmount: totals.cgst,
        sgstAmount: totals.sgst,
        igstAmount: totals.igst,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTax,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        balanceDue: totals.totalAmount,
        status: "ISSUED",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        notes: parsed.data.notes || null,
      },
    });
  } catch (err) {
    console.error("createInvoice failed:", err);
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Could not save the invoice. Please try again.")}`);
  }

  revalidatePath(`/${tenant.slug}/billing`);
  redirect(`/${tenant.slug}/billing/${created.id}`);
}

export async function recordPayment(formData: FormData): Promise<void> {
  const { tenant } = await requireClinicAccess(formData.get("clinicSlug") as string);

  const invoiceId = formData.get("invoiceId") as string;
  const parsed = z
    .object({
      amount: z.coerce.number().min(0.01, "Enter a payment amount").max(10000000),
      method: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "RAZORPAY", "STRIPE"]),
      transactionRef: z.string().trim().max(60).optional().or(z.literal("")),
    })
    .safeParse({
      amount: formData.get("amount"),
      method: formData.get("method"),
      transactionRef: formData.get("transactionRef") || "",
    });

  if (!parsed.success) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, orgId: tenant.id },
    select: {
      id: true,
      invoiceNumber: true,
      totalAmount: true,
      balanceDue: true,
      patientId: true,
    },
  });

  if (!invoice) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Invoice not found in this clinic.")}`);
  }

  const amount = parsed.data.amount;
  const due = Number(invoice.balanceDue);

  if (amount > due + 0.005) {
    redirect(
      `/${tenant.slug}/billing?error=${encodeURIComponent(
        `Payment ₹${amount} exceeds balance due ₹${due.toFixed(2)}.`
      )}`
    );
  }

  const receiptNumber = `${invoice.invoiceNumber}/R${String(
    (await db.payment.count({ where: { invoiceId: invoice.id } })) + 1
  ).padStart(2, "0")}`;

  const newDue = Math.max(0, Math.round((due - amount) * 100) / 100);

  try {
    await db.$transaction([
      db.payment.create({
        data: {
          orgId: tenant.id,
          invoiceId: invoice.id,
          amount,
          method: parsed.data.method,
          transactionRef: parsed.data.transactionRef || null,
          receiptNumber,
        },
      }),
      db.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: newDue,
          status: newDue <= 0.005 ? "PAID" : "PARTIALLY_PAID",
        },
      }),
    ]);
  } catch (err) {
    console.error("recordPayment failed:", err);
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Could not record the payment.")}`);
  }

  revalidatePath(`/${tenant.slug}/billing`);
  redirect(`/${tenant.slug}/billing/${invoice.id}`);
}

/** Re-sends the pending bill over WhatsApp using the Meta Cloud API client */
export async function sendBillWhatsApp(formData: FormData): Promise<void> {
  const { tenant } = await requireClinicAccess(formData.get("clinicSlug") as string);

  if (!hasFeature(tenant.features, "whatsapp_automations")) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("WhatsApp automations are not enabled for this clinic.")}`);
  }

  const invoiceId = formData.get("invoiceId") as string;

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, orgId: tenant.id },
    select: {
      invoiceNumber: true,
      totalAmount: true,
      balanceDue: true,
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!invoice || Number(invoice.balanceDue) <= 0.005) {
    redirect(`/${tenant.slug}/billing?error=${encodeURIComponent("Nothing pending to send for this invoice.")}`);
  }

  const org = await db.organization.findUniqueOrThrow({
    where: { id: tenant.id },
    select: { name: true },
  });

  await sendAutomatedBillWhatsApp({
    orgId: tenant.id,
    patientId: invoice.patient.id,
    toPhone: invoice.patient.phone,
    patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
    invoiceNumber: invoice.invoiceNumber,
    amount: `₹${Number(invoice.balanceDue).toFixed(2)}`,
    clinicName: org.name,
    portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://med.brainorth.com"}/${tenant.slug}/portal`,
  });

  revalidatePath(`/${tenant.slug}/billing`);
  redirect(`/${tenant.slug}/billing/${invoiceId}`);
}
