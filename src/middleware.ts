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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Skip system routes or empty path
  if (segments.length === 0 || PUBLIC_OR_SYSTEM_PATHS.has(segments[0])) {
    return NextResponse.next();
  }

  const clinicSlug = segments[0];

  // Set clinic slug header so Server Components & Route Handlers can read it without parsing params
  const requestHeaders = new Headers(request.headers);
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

