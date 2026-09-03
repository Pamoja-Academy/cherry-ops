import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/hero/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "cherry-ops-secret-2026-contest";

  // Production HTTPS sets `__Secure-authjs.session-token`. Without secureCookie,
  // getToken misses it → post-login loop back to /login while /api/auth/session works.
  const secureCookie =
    request.nextUrl.protocol === "https:" || process.env.VERCEL === "1";

  const token =
    (await getToken({ req: request, secret, secureCookie })) ??
    (await getToken({ req: request, secret, secureCookie: !secureCookie }));

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
