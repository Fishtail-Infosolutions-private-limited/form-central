import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession, SessionPayload } from "./session";
import { prisma } from "../db/prisma";

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return admin;
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
