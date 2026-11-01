import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  features: Record<string, boolean>;
  settings: Record<string, unknown>;
  currency: string;
}

/**
 * Resolves the tenant organization by slug. Caches or queries from DB.
 */
export async function getTenantBySlug(slug: string): Promise<TenantContext> {
  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      features: true,
      settings: true,
      currency: true,
    },
  });

  if (!org) {
    notFound();
  }

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    features: (org.features as Record<string, boolean>) || {},
    settings: (org.settings as Record<string, unknown>) || {},
    currency: org.currency || "USD",
  };
}

