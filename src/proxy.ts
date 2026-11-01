import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const FALLBACK_AUTH_SECRET = "f1294748238884d5a028ef804256685fc4bcfff56d023cb696b7da5bfea194a3";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode(FALLBACK_AUTH_SECRET);
}

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const encoded = getSecretKey();
    await jwtVerify(token, encoded, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("fc_admin_session")?.value;
  const hasValidSession = await isValidSession(sessionCookie);

  // Root route (/) is the public Home page: always accessible
  if (pathname === "/") {
    return NextResponse.next();
  }

  // /admin/login: if already logged in, redirect to dashboard
  if (pathname === "/admin/login") {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes: redirect unauthenticated users to /admin/login
  if (pathname.startsWith("/admin")) {
    if (!hasValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin" && pathname !== "/admin/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) {
        response.cookies.delete("fc_admin_session");
      }
      return response;
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/", "/admin/:path*"],
};
