import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Signed session cookie (HMAC-SHA256). Contains only the user id;
 * every request re-verifies memberships in the database, so revoking
 * access takes effect immediately without touching the cookie.
 */

export const SESSION_COOKIE = "brainorth_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Add it to .env (any long random string) and restart."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Verifies the signature and expiry. Returns the userId, or null.
 */
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  const payload = `${userId}.${expires}`;

  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);
  if (
    expectedBuf.length !== receivedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    return null;
  }

  if (Number(expires) < Date.now()) return null;

  return userId;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Reads and verifies the session cookie inside a Server Component /
 * Server Action. Returns the userId, or null when not logged in.
 */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}
