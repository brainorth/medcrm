import crypto from "crypto";

const KEY_LENGTH = 64;

/**
 * Hash a password with scrypt (Node built-in, no external deps).
 * Format: "<salt hex>:<hash hex>"
 * The same format is used by prisma/seed.js so seeds and the app stay compatible.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Constant-time password verification.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = crypto.scryptSync(password, salt, hashBuf.length);

  return crypto.timingSafeEqual(hashBuf, testBuf);
}
