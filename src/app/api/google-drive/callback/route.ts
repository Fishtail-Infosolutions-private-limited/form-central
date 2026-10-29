import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleOAuthCallback } from "@/lib/google-drive/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const redirectTarget = new URL("/admin/settings/integrations/google-drive", request.url);

  if (error) {
    redirectTarget.searchParams.set("error", `Google authorization denied: ${error}`);
    return NextResponse.redirect(redirectTarget);
  }

  if (!code || !state) {
    redirectTarget.searchParams.set("error", "Invalid authorization code or state");
    return NextResponse.redirect(redirectTarget);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gdrive_oauth_state")?.value;
  cookieStore.delete("gdrive_oauth_state");

  if (!savedState || savedState !== state) {
    redirectTarget.searchParams.set(
      "error",
      "OAuth CSRF validation failed. Please try connecting Google Drive again."
    );
    return NextResponse.redirect(redirectTarget);
  }

  try {
    await handleOAuthCallback(code);
    redirectTarget.searchParams.set("connected", "true");
    return NextResponse.redirect(redirectTarget);
  } catch (err: unknown) {
    console.error("Google Drive OAuth Callback error:", err);
    redirectTarget.searchParams.set(
      "error",
      "Failed to complete Google Drive connection. Check client credentials and network."
    );
    return NextResponse.redirect(redirectTarget);
  }
}

