import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "delft-apartment-secret-key-change-in-production"
);

const COOKIE_NAME = "delft_admin_session";
const EXPIRY = "8h"; // Session expires after 8 hours

export interface AdminSession {
  id: string;
  username: string;
  name: string;
  role: string;
}

/**
 * Create a signed JWT token for the admin session
 */
export async function createSessionToken(admin: AdminSession): Promise<string> {
  const token = await new SignJWT({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setIssuer("delft-apartment")
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: "delft-apartment",
    });

    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Set the session cookie (called from API routes / Server Actions)
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get the current session from cookies (server-side only)
 */
export async function getCurrentSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Get session from a Request object (for middleware / route handlers)
 */
export function getSessionFromRequest(
  request: Request
): AdminSession | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`${COOKIE_NAME}=([^;]+)`)
  );
  if (!match) return null;

  // We can't await in non-async context, so we decode manually for middleware
  // For API routes, use getCurrentSession() instead
  return null; // Middleware uses verifySessionFromRequest instead
}

export { COOKIE_NAME };
