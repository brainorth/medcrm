-- Brainorth Med: Multi-Tenant PostgreSQL DDL & Row-Level Security (RLS)

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE "StaffRole" AS ENUM ('SUPERADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LAB_TECH', 'BILLING_OFFICER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'STRIPE', 'RAZORPAY', 'BANK_TRANSFER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "CommChannel" AS ENUM ('WHATSAPP', 'SMS', 'EMAIL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "CommDirection" AS ENUM ('OUTBOUND', 'INBOUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "CommStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Core Tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    features JSONB NOT NULL DEFAULT '{"whatsapp_automations": true, "telehealth": false, "advanced_analytics": false}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role "StaffRole" NOT NULL DEFAULT 'RECEPTIONIST',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    specialty VARCHAR(150),
    license_no VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_membership_org_user UNIQUE (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    mrn VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(30),
    blood_group VARCHAR(10),
    emergency_contact JSONB,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_patient_org_mrn UNIQUE (org_id, mrn)
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES memberships(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    type VARCHAR(100) NOT NULL DEFAULT 'Consultation',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES memberships(id),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES memberships(id),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    advice TEXT,
    digital_signature TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    balance_due NUMERIC(12, 2) NOT NULL,
    status "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    due_date TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_org_num UNIQUE (org_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    method "PaymentMethod" NOT NULL DEFAULT 'CASH',
    transaction_ref VARCHAR(255),
    receipt_number VARCHAR(100),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    channel "CommChannel" NOT NULL DEFAULT 'WHATSAPP',
    direction "CommDirection" NOT NULL DEFAULT 'OUTBOUND',
    template_name VARCHAR(100),
    message_body TEXT NOT NULL,
    media_url TEXT,
    status "CommStatus" NOT NULL DEFAULT 'QUEUED',
    external_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cfd_org_entity_key UNIQUE (org_id, entity_type, field_key)
);

-- 4. Multi-Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_org ON patients(org_id);
CREATE INDEX IF NOT EXISTS idx_patients_org_phone ON patients(org_id, phone);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org_start ON appointments(org_id, start_time);
CREATE INDEX IF NOT EXISTS idx_records_org_patient ON medical_records(org_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_org_patient ON prescriptions(org_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_patient ON invoices(org_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_org_invoice ON payments(org_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_communications_org ON communications(org_id);
CREATE INDEX IF NOT EXISTS idx_communications_ext ON communications(external_id);

-- 5. Row-Level Security (RLS) Setup
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- Helper to extract current active org_id from JWT or app context
-- (In Supabase: (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid)
-- (In Node/Postgres session: current_setting('app.current_org_id', true)::uuid)
CREATE OR REPLACE FUNCTION current_app_org_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_org_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies enforcing strict tenant boundary
CREATE POLICY tenant_isolation_patients ON patients
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_appointments ON appointments
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_records ON medical_records
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_prescriptions ON prescriptions
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_invoices ON invoices
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_payments ON payments
    FOR ALL USING (org_id = current_app_org_id());

CREATE POLICY tenant_isolation_comms ON communications
    FOR ALL USING (org_id = current_app_org_id());

