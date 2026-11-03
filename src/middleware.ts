import { NextResponse, type NextRequest } from "next/server";

// Paths that should not be interpreted as clinic slugs
const PUBLIC_OR_SYSTEM_PATHS = new Set([
  "",
  "api",
  "_next",
  "login",
  "register",
  "forgot-password",
  "favicon.ico",
  "manifest.json",
  "robots.txt",
]);

const SESSION_COOKIE = "brainorth_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Skip system routes or empty path
  if (segments.length === 0 || PUBLIC_OR_SYSTEM_PATHS.has(segments[0])) {
    return NextResponse.next();
  }

  const clinicSlug = segments[0];

  // Session cookie presence check (Edge-safe, no crypto here).
  // Real signature + membership verification happens server-side in
  // requireClinicAccess() — this is just the fast redirect.
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // A per-clinic login page (/:clinic/login) must stay reachable for
  // logged-out users — the (auth) route group handles it.
  const isClinicLoginPage = segments[1] === "login";

  let requestHeaders = new Headers(request.headers);

  if (!hasSession && !isClinicLoginPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Set clinic slug header so Server Components & Route Handlers can read it without parsing params
  requestHeaders.set("x-tenant-slug", clinicSlug);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/webhooks (external webhook routes)
     * 2. /_next (Next.js internals)
     * 3. /_static, /images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};

