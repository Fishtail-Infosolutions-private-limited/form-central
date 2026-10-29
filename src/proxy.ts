import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) return false;
    const encoded = new TextEncoder().encode(secret);
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
    const response = NextResponse.next();
    if (sessionCookie && !hasValidSession) {
      response.cookies.delete("fc_admin_session");
    }
    return response;
  }

  // /admin/login: if already logged in, redirect to dashboard
  if (pathname === "/admin/login") {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    const response = NextResponse.next();
    if (sessionCookie && !hasValidSession) {
      response.cookies.delete("fc_admin_session");
    }
    return response;
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

export const config = {
  matcher: ["/", "/admin/:path*"],
};
