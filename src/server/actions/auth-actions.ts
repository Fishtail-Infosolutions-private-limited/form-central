"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createAdminSession, deleteAdminSession, getAdminSession } from "@/lib/auth/session";
import { sendAdminPasswordResetEmail } from "@/lib/email/client";

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

/**
 * Change Admin Password (when signed in from Settings)
 */
export async function changeAdminPasswordAction(formData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  if (!formData.currentPassword || !formData.newPassword) {
    return { success: false, error: "Please enter your current and new password." };
  }

  if (formData.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!admin) {
      return { success: false, error: "Admin account not found." };
    }

    const isValid = await verifyPassword(formData.currentPassword, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = await hashPassword(formData.newPassword);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "ADMIN_PASSWORD_CHANGED",
        entityType: "USER",
        entityId: admin.id,
        metadata: { timestamp: new Date().toISOString() },
      },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Change password error:", err);
    return { success: false, error: "Failed to update password." };
  }
}

/**
 * Request Password Reset Code
 * Rule: Only works if internal connected Google account matches!
 */
export async function sendAdminPasswordResetOtpAction(email: string): Promise<{
  success: boolean;
  error?: string;
  resetSessionId?: string;
  maskedEmail?: string;
}> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    // 1. Verify internal connected Google account
    const driveIntegration = await prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    });

    if (!driveIntegration || !driveIntegration.isConnected || !driveIntegration.accountEmail) {
      return {
        success: false,
        error:
          "Password reset is disabled because no internal Google account is currently connected in Settings.",
      };
    }

    const connectedEmail = driveIntegration.accountEmail.trim().toLowerCase();
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // Email must match the connected Google account OR the admin user
    const isConnectedMatch = cleanEmail === connectedEmail;
    const isAdminMatch = adminUser && adminUser.email.toLowerCase() === cleanEmail;

    if (!isConnectedMatch && !isAdminMatch) {
      return {
        success: false,
        error:
          "Access restricted: Password recovery is permitted only for the internal connected Google account.",
      };
    }

    // Always deliver the verification OTP to the verified connected Google account
    const targetDeliveryEmail = connectedEmail;

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await hashPassword(code);
    const resetSessionId = nanoid(24);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in AuditLog for robust, zero-migration persistence
    await prisma.auditLog.create({
      data: {
        actorEmail: cleanEmail,
        action: "ADMIN_PASSWORD_RESET_OTP",
        entityType: "PASSWORD_RESET",
        entityId: resetSessionId,
        metadata: {
          accountEmail: cleanEmail,
          deliveryEmail: targetDeliveryEmail,
          codeHash,
          expiresAt: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
        },
      },
    });

    // Send email via SMTP
    await sendAdminPasswordResetEmail({
      to: targetDeliveryEmail,
      otpCode: code,
      expiresInMinutes: 10,
    });

    // Mask recipient email (e.g. bi***@fishtailinfosolutions.com)
    const [local, domain] = targetDeliveryEmail.split("@");
    const maskedLocal =
      local.length > 2
        ? local.slice(0, 2) + "***" + (local.length > 3 ? local.slice(-1) : "")
        : local + "***";
    const maskedEmail = `${maskedLocal}@${domain}`;

    return {
      success: true,
      resetSessionId,
      maskedEmail,
    };
  } catch (err: unknown) {
    console.error("sendAdminPasswordResetOtpAction error:", err);
    return {
      success: false,
      error: "Failed to dispatch verification email. Please check SMTP configuration.",
    };
  }
}

/**
 * Verify 6-digit Reset OTP
 */
export async function verifyAdminPasswordResetOtpAction(
  resetSessionId: string,
  code: string
): Promise<{ success: boolean; error?: string; resetToken?: string }> {
  if (!code || code.trim().length !== 6) {
    return { success: false, error: "Please enter the complete 6-digit verification code." };
  }

  try {
    const resetRecord = await prisma.auditLog.findFirst({
      where: {
        action: "ADMIN_PASSWORD_RESET_OTP",
        entityType: "PASSWORD_RESET",
        entityId: resetSessionId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetRecord || !resetRecord.metadata) {
      return { success: false, error: "Session expired or invalid. Please request a new code." };
    }

    const meta = resetRecord.metadata as any;
    if (new Date() > new Date(meta.expiresAt)) {
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    if ((meta.attempts || 0) >= 5) {
      return { success: false, error: "Too many incorrect attempts. Please request a new code." };
    }

    const isValid = await verifyPassword(code.trim(), meta.codeHash);
    if (!isValid) {
      await prisma.auditLog.update({
        where: { id: resetRecord.id },
        data: {
          metadata: {
            ...meta,
            attempts: (meta.attempts || 0) + 1,
          },
        },
      });
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    // Generate secure single-use resetToken
    const resetToken = nanoid(32);
    await prisma.auditLog.update({
      where: { id: resetRecord.id },
      data: {
        metadata: {
          ...meta,
          verified: true,
          resetToken,
        },
      },
    });

    return { success: true, resetToken };
  } catch (err: unknown) {
    console.error("verifyAdminPasswordResetOtpAction error:", err);
    return { success: false, error: "Verification failed. Please retry." };
  }
}

/**
 * Complete Admin Password Reset
 */
export async function resetAdminPasswordAction(
  resetSessionId: string,
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  try {
    const resetRecord = await prisma.auditLog.findFirst({
      where: {
        action: "ADMIN_PASSWORD_RESET_OTP",
        entityType: "PASSWORD_RESET",
        entityId: resetSessionId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetRecord || !resetRecord.metadata) {
      return { success: false, error: "Reset session not found. Please start over." };
    }

    const meta = resetRecord.metadata as any;
    if (!meta.verified || meta.resetToken !== resetToken || meta.used) {
      return { success: false, error: "Unauthorized password reset attempt. Please start over." };
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Update all admin users (or primary admin)
    await prisma.adminUser.updateMany({
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Invalidate reset token
    await prisma.auditLog.update({
      where: { id: resetRecord.id },
      data: {
        metadata: {
          ...meta,
          used: true,
          resetToken: null,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorEmail: meta.deliveryEmail || meta.accountEmail,
        action: "ADMIN_PASSWORD_RESET_SUCCESS",
        entityType: "USER",
        entityId: resetSessionId,
        metadata: { timestamp: new Date().toISOString() },
      },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("resetAdminPasswordAction error:", err);
    return { success: false, error: "Failed to reset password." };
  }
}
