export type FeatureKey =
  | "whatsapp_automations"
  | "telehealth"
  | "advanced_analytics"
  | "custom_intake_forms"
  | "multi_branch"
  | "online_payments";

export interface TenantFeatures {
  [key: string]: boolean;
}

/**
 * Checks whether a given organization tenant has a specific feature enabled.
 */
export function hasFeature(
  features: TenantFeatures | unknown,
  featureKey: FeatureKey
): boolean {
  if (!features || typeof features !== "object") {
    return false;
  }
  return Boolean((features as Record<string, boolean>)[featureKey]);
}

/**
 * Throws or returns an error response if the feature is not active for this tenant.
 */
export function assertFeature(features: unknown, featureKey: FeatureKey): void {
  if (!hasFeature(features, featureKey)) {
    throw new Error(`Feature '${featureKey}' is disabled for this organization.`);
  }
}

