import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession, SessionPayload } from "./session";
import { prisma } from "../db/prisma";

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) return null;

  try {
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { id: session.userId },
          { email: session.email },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (admin) return admin;

    // Fallback if session token is valid and signed by server secret
    if (session.userId && session.email) {
      return {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        createdAt: new Date(),
      };
    }
  } catch (error) {
    console.error("Error fetching current admin:", error);
    if (session.userId && session.email) {
      return {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        createdAt: new Date(),
      };
    }
  }

  return null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Administrator access required");
  }
  return admin;
}
