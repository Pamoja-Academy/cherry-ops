import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API and static internals — allow
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Check for session token (secret resolution must match src/lib/auth.ts)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "cherry-ops-secret-2026-contest",
  });

  // Signed-in users have no business on the login page
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
