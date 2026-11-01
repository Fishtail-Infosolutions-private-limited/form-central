import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { getAuthorizationUrl } from "@/lib/google-drive/client";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const state = nanoid(32);
  const cookieStore = await cookies();

  const isHttps = request.url.startsWith("https://") || (process.env.APP_URL?.startsWith("https://") ?? false);

  cookieStore.set("gdrive_oauth_state", state, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" ? true : process.env.COOKIE_SECURE === "false" ? false : isHttps,
    sameSite: "lax",
    maxAge: 10 * 60, // 10 minutes
    path: "/",
  });

  const authUrl = getAuthorizationUrl(state);
  return NextResponse.redirect(authUrl);
}

