"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession, deleteAdminSession, getAdminSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAdminAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: result.data.email },
    });

    if (!admin) {
      return {
        error: "Invalid email or password. Please try again.",
      };
    }

    const isMatch = await verifyPassword(result.data.password, admin.passwordHash);
    if (!isMatch) {
      return {
        error: "Invalid email or password. Please try again.",
      };
    }

    // Create secure admin session
    await createAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "ADMIN_LOGIN",
        entityType: "USER",
        entityId: admin.id,
        metadata: { timestamp: new Date().toISOString() },
      },
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return {
      error: "An unexpected error occurred during login. Please try again.",
    };
  }

  redirect("/admin/dashboard");
}

export async function logoutAdminAction(): Promise<void> {
  const session = await getAdminSession();
  if (session) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          actorEmail: session.email,
          action: "ADMIN_LOGOUT",
          entityType: "USER",
          entityId: session.userId,
        },
      });
    } catch {
      // ignore audit log failure during logout
    }
  }

  await deleteAdminSession();
  redirect("/");
}
