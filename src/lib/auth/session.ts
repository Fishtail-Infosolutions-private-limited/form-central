import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const AUTH_COOKIE_NAME = "fc_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FALLBACK_AUTH_SECRET = "f1294748238884d5a028ef804256685fc4bcfff56d023cb696b7da5bfea194a3";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }
  return FALLBACK_AUTH_SECRET;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  expiresAt: number;
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(getSecretKey());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createAdminSession(user: {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
}) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await encryptSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt,
  });

  // Determine if connection is HTTPS.
  // Over plain HTTP (e.g. direct IP http://209.145.62.242:3028), browsers strictly reject
  // cookies with the Secure flag, which causes admin sessions to be lost on refresh.
  let isHttps = false;
  try {
    const headerList = await headers();
    const proto = (headerList.get("x-forwarded-proto") || "").toLowerCase();
    const referer = (headerList.get("referer") || "").toLowerCase();

    if (proto === "http" || referer.startsWith("http://")) {
      isHttps = false;
    } else if (proto === "https" || referer.startsWith("https://")) {
      isHttps = true;
    } else {
      isHttps = process.env.APP_URL?.startsWith("https://") ?? false;
    }
  } catch {
    isHttps = false;
  }

  const isSecure =
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
      ? false
      : isHttps;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });

  return token;
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return decryptSession(token);
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
