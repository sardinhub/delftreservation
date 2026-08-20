import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "delft-apartment-secret-key-change-in-production"
);

const COOKIE_NAME = "delft_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-admin routes
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Allow login page and login/logout API without checking
  const isPublicRoute =
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout";

  // /api/admin/me needs to work even when not logged in (returns 401)
  const isSessionCheck = pathname === "/api/admin/me";

  if (isPublicRoute || isSessionCheck) {
    // If on login page with valid session, redirect to dashboard
    if (pathname === "/admin/login") {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, SECRET_KEY, { issuer: "delft-apartment" });
          return NextResponse.redirect(new URL("/admin", request.url));
        } catch {
          // Invalid token — clear and allow login
          const response = NextResponse.next();
          response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
          return response;
        }
      }
    }
    return NextResponse.next();
  }

  // Check for session token on protected routes
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // API routes return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized — silakan login" },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Verify the token
  try {
    await jwtVerify(token, SECRET_KEY, { issuer: "delft-apartment" });
    return NextResponse.next();
  } catch {
    // Invalid or expired token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Session expired — silakan login kembali" },
        { status: 401 }
      );
    }
    // Clear invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
