/* eslint-disable */
/**
 * Brainorth Med — database seed
 *
 * Run:  node prisma/seed.js
 * (requires DATABASE_URL in .env and `npx prisma db push` to have been run)
 *
 * Creates:
 *   - 2 organizations (clinics): demo-clinic + brainorth-dental
 *   - A doctor user who is a member of BOTH clinics (workspace-switch demo)
 *   - A receptionist user for demo-clinic only
 *   - 6 patients, 4 appointments in demo-clinic
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const db = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_PASSWORD = "Med@1234";

async function main() {
  console.log("Seeding...");

  // ------------------------------------------------------------------
  // Organizations
  // ------------------------------------------------------------------
  const demoClinic = await db.organization.upsert({
    where: { slug: "demo-clinic" },
    update: {
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29ABCDE1234F1Z5",
      stateName: "Karnataka",
      invoicePrefix: "DFC",
    },
    create: {
      name: "Demo Family Clinic",
      slug: "demo-clinic",
      email: "hello@democlinic.com",
      phone: "+918012345678",
      address: "12, 100 Feet Road, Indiranagar, Bengaluru - 560038",
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29ABCDE1234F1Z5",
      stateName: "Karnataka",
      invoicePrefix: "DFC",
      features: {
        whatsapp_automations: true,
        telehealth: true,
        advanced_analytics: true,
        custom_intake_forms: true,
        multi_branch: true,
        online_payments: false,
      },
    },
  });

  const dental = await db.organization.upsert({
    where: { slug: "brainorth-dental" },
    update: {
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29FGHIJ5678K2L3",
      stateName: "Karnataka",
      invoicePrefix: "BDC",
    },
    create: {
      name: "Brainorth Dental Care",
      slug: "brainorth-dental",
      email: "hello@brainorthdental.com",
      phone: "+918098765432",
      address: "5, MG Road, Bengaluru - 560001",
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29FGHIJ5678K2L3",
      stateName: "Karnataka",
      invoicePrefix: "BDC",
      features: {
        whatsapp_automations: false,
        telehealth: false,
        advanced_analytics: false,
        custom_intake_forms: false,
        multi_branch: false,
        online_payments: false,
      },
    },
  });

  const apexClinic = await db.organization.upsert({
    where: { slug: "apex-clinic" },
    update: {
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29APEX1234F1Z9",
      stateName: "Karnataka",
      invoicePrefix: "APC",
    },
    create: {
      name: "Apex Multi-Specialty Clinic",
      slug: "apex-clinic",
      email: "hello@apexclinic.com",
      phone: "+918023456789",
      address: "10, Outer Ring Road, Bengaluru - 560103",
      currency: "INR",
      timezone: "Asia/Kolkata",
      gstin: "29APEX1234F1Z9",
      stateName: "Karnataka",
      invoicePrefix: "APC",
      features: {
        whatsapp_automations: true,
        telehealth: true,
        advanced_analytics: true,
        custom_intake_forms: true,
        multi_branch: true,
        online_payments: false,
      },
    },
  });

  // ------------------------------------------------------------------
  // Users + memberships (same password for all seeded users)
  // ------------------------------------------------------------------
  const usersToSeed = [
    {
      email: "aisha@brainorth.com",
      fullName: "Dr. Aisha Khan",
      memberships: [
        { orgId: demoClinic.id, role: "DOCTOR", specialty: "Cardiology", licenseNo: "MD-112233" },
        { orgId: dental.id, role: "DOCTOR", specialty: "Dentistry", licenseNo: "DD-445566" },
        { orgId: apexClinic.id, role: "DOCTOR", specialty: "Orthopedics", licenseNo: "AP-998877" },
      ],
    },
    {
      email: "sarah@brainorth.com",
      fullName: "Sarah Lee",
      memberships: [
        { orgId: demoClinic.id, role: "RECEPTIONIST", specialty: null, licenseNo: null },
        { orgId: apexClinic.id, role: "RECEPTIONIST", specialty: null, licenseNo: null },
      ],
    },
  ];

  const createdMemberships = [];

  for (const u of usersToSeed) {
    const user = await db.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hashPassword(DEFAULT_PASSWORD), fullName: u.fullName },
      create: {
        email: u.email,
        fullName: u.fullName,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
      },
    });

    for (const m of u.memberships) {
      const membership = await db.membership.upsert({
        where: { orgId_userId: { orgId: m.orgId, userId: user.id } },
        update: { role: m.role, specialty: m.specialty, isActive: true },
        create: { ...m, userId: user.id },
      });
      createdMemberships.push({ user, membership });
    }
  }

  // Resolve doctor membership for demo-clinic explicitly (safe lookup)
  const demoDoctorMembership = await db.membership.findFirst({
    where: { orgId: demoClinic.id, role: "DOCTOR" },
  });

  // ------------------------------------------------------------------
  // Patients (demo-clinic)
  // ------------------------------------------------------------------
  const patientSeed = [
    { mrn: "MRN-10001", firstName: "Michael", lastName: "Vance", phone: "+919812345678", gender: "Male", bloodGroup: "O+", dateOfBirth: new Date("1987-04-12") },
    { mrn: "MRN-10002", firstName: "Sarah", lastName: "Connor", phone: "+919823456789", gender: "Female", bloodGroup: "A+", dateOfBirth: new Date("1992-09-30") },
    { mrn: "MRN-10003", firstName: "David", lastName: "Miller", phone: "+919834567890", gender: "Male", bloodGroup: "B+", dateOfBirth: new Date("1974-01-22") },
    { mrn: "MRN-10004", firstName: "Priya", lastName: "Sharma", phone: "+919845678901", gender: "Female", bloodGroup: "AB+", dateOfBirth: new Date("1990-11-05") },
    { mrn: "MRN-10005", firstName: "Elena", lastName: "Rodriguez", phone: "+919856789012", gender: "Female", bloodGroup: "O-", dateOfBirth: new Date("1983-06-18") },
    { mrn: "MRN-10006", firstName: "Tom", lastName: "Okafor", phone: "+919867890123", gender: "Male", bloodGroup: "A-", dateOfBirth: new Date("1969-03-27") },
  ];

  const patients = [];
  for (const p of patientSeed) {
    const existing = await db.patient.findUnique({
      where: { orgId_mrn: { orgId: demoClinic.id, mrn: p.mrn } },
    });
    if (existing) {
      patients.push(existing);
    } else {
      patients.push(
        await db.patient.create({ data: { orgId: demoClinic.id, ...p } })
      );
    }
  }

  // ------------------------------------------------------------------
  // Appointments (today + tomorrow)
  // ------------------------------------------------------------------
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const appointmentSeed = [
    { patient: 0, offsetH: 0, status: "COMPLETED", type: "Consultation" },
    { patient: 1, offsetH: 2, status: "SCHEDULED", type: "Follow-up" },
    { patient: 2, offsetH: 4, status: "SCHEDULED", type: "Consultation" },
    { patient: 3, offsetH: 26, status: "SCHEDULED", type: "Telehealth" },
  ];

  const existingCount = await db.appointment.count({ where: { orgId: demoClinic.id } });
  if (existingCount === 0) {
    for (const a of appointmentSeed) {
      const start = new Date(today);
      start.setHours(today.getHours() + a.offsetH);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      await db.appointment.create({
        data: {
          orgId: demoClinic.id,
          patientId: patients[a.patient].id,
          doctorId: demoDoctorMembership.id,
          startTime: start,
          endTime: end,
          status: a.status,
          type: a.type,
          reason: "Seeded appointment",
        },
      });
    }
  }

  // ------------------------------------------------------------------
  // Sample GST invoices + payments (demo-clinic only)
  // ------------------------------------------------------------------
  const invoiceCount = await db.invoice.count({ where: { orgId: demoClinic.id } });
  if (invoiceCount === 0) {
    const mkLines = (arr) =>
      arr.map(([description, hsnCode, quantity, unitPrice, taxRate]) => ({
        description, hsnCode, quantity, unitPrice, taxRate,
        lineTotal: quantity * unitPrice,
        taxableValue: quantity * unitPrice,
        taxAmount: Math.round(((quantity * unitPrice) * taxRate) / 100 * 100) / 100,
      }));

    // A. Fully paid: consultation + ECG (exempt services + 0% GST)
    const linesA = mkLines([
      ["General Physician Consultation", "SAC-978024", 1, 600, 0],
      ["ECG (Electrocardiogram)", "SAC-978043", 1, 400, 0],
    ]);
    const invA = await db.invoice.create({
      data: {
        orgId: demoClinic.id,
        patientId: patients[0].id,
        invoiceNumber: "DFC-2026-0001",
        items: linesA,
        gstMode: "INTRA",
        clinicGstin: "29ABCDE1234F1Z5",
        placeOfSupply: "Karnataka",
        cgstAmount: 0, sgstAmount: 0, igstAmount: 0,
        subtotal: 1000, taxAmount: 0, discountAmount: 0,
        totalAmount: 1000, balanceDue: 0, status: "PAID",
        notes: "Walk-in consultation.",
      },
    });
    await db.payment.create({
      data: { orgId: demoClinic.id, invoiceId: invA.id, amount: 1000, method: "UPI", receiptNumber: "DFC-2026-0001/R01", transactionRef: "UPI-7739201" },
    });

    // B. Partially paid: pharmacy + lab with 12% GST
    const linesB = mkLines([
      ["Azithromycin 500mg (5 tab strip)", "3004", 2, 95, 12],
      ["Blood Panel (CBC)", "9011", 1, 850, 12],
    ]);
    const subtotalB = 1040, taxB = 124.8, totalB = 1164.8;
    const invB = await db.invoice.create({
      data: {
        orgId: demoClinic.id,
        patientId: patients[3].id,
        invoiceNumber: "DFC-2026-0002",
        items: linesB,
        gstMode: "INTRA",
        clinicGstin: "29ABCDE1234F1Z5",
        placeOfSupply: "Karnataka",
        cgstAmount: taxB / 2, sgstAmount: taxB / 2, igstAmount: 0,
        subtotal: subtotalB, taxAmount: taxB, discountAmount: 50,
        totalAmount: totalB, balanceDue: totalB - 500, status: "PARTIALLY_PAID",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    await db.payment.create({
      data: { orgId: demoClinic.id, invoiceId: invB.id, amount: 500, method: "CASH", receiptNumber: "DFC-2026-0002/R01" },
    });

    // C. Unpaid procedure with 18% GST
    const linesC = mkLines([
      ["Minor Surgical Dressing", "SAC-978101", 1, 1800, 18],
      ["Nebulisation", "SAC-978099", 2, 350, 18],
    ]);
    const subtotalC = 2500, taxC = 450, totalC = 2950;
    await db.invoice.create({
      data: {
        orgId: demoClinic.id,
        patientId: patients[5].id,
        invoiceNumber: "DFC-2026-0003",
        items: linesC,
        gstMode: "INTRA",
        clinicGstin: "29ABCDE1234F1Z5",
        placeOfSupply: "Karnataka",
        cgstAmount: taxC / 2, sgstAmount: taxC / 2, igstAmount: 0,
        subtotal: subtotalC, taxAmount: taxC, discountAmount: 0,
        totalAmount: totalC, balanceDue: totalC, status: "ISSUED",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("   Sample invoices seeded (1 paid, 1 partially paid, 1 unpaid).");
  }

  console.log("");
  console.log("✅ Seed complete!");
  console.log("");
  console.log("   Clinic 1:  http://localhost:3000/demo-clinic/dashboard");
  console.log("   Clinic 2:  http://localhost:3000/brainorth-dental/dashboard");
  console.log("");
  console.log(`   Login (doctor, both clinics):  aisha@brainorth.com / ${DEFAULT_PASSWORD}`);
  console.log(`   Login (receptionist, clinic 1): sarah@brainorth.com / ${DEFAULT_PASSWORD}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
