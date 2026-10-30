"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  listFolders,
  createFolder,
  selectDestinationFolder,
  disconnectDrive,
} from "@/lib/google-drive/client";
import { prisma } from "@/lib/db/prisma";

export async function listDriveFoldersAction(parentId?: string) {
  await requireAdmin();
  try {
    const folders = await listFolders(parentId);
    return { success: true, folders };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list folders";
    return { success: false, error: message };
  }
}

export async function createDriveFolderAction(name: string, parentId?: string) {
  const admin = await requireAdmin();
  try {
    const folder = await createFolder(name, parentId);
    if (!folder?.id || !folder?.name) {
      return { success: false, error: "Failed to create folder on Google Drive" };
    }

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "GOOGLE_DRIVE_FOLDER_CREATED",
        entityType: "INTEGRATION",
        entityId: folder.id,
        metadata: { folderName: folder.name },
      },
    });

    return { success: true, folder };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create folder";
    return { success: false, error: message };
  }
}

export async function selectDriveFolderAction(folderId: string, folderName: string) {
  const admin = await requireAdmin();
  try {
    await selectDestinationFolder(folderId, folderName);

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "GOOGLE_DRIVE_DESTINATION_FOLDER_SELECTED",
        entityType: "INTEGRATION",
        entityId: folderId,
        metadata: { folderName },
      },
    });

    revalidatePath("/admin/settings/integrations/google-drive");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save selected folder";
    return { success: false, error: message };
  }
}

export async function disconnectDriveAction() {
  const admin = await requireAdmin();
  try {
    await disconnectDrive();

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "GOOGLE_DRIVE_DISCONNECTED",
        entityType: "INTEGRATION",
        entityId: "primary",
      },
    });

    revalidatePath("/admin/settings/integrations/google-drive");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to disconnect";
    return { success: false, error: message };
  }
}

export async function listConnectedDriveAccountsAction() {
  await requireAdmin();
  try {
    const primary = await prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    });

    // History records (exclude primary row to avoid stale primary duplicates)
    const historyRecords = await prisma.googleDriveIntegration.findMany({
      where: {
        id: { not: "primary" },
        accountEmail: { not: null },
      },
      orderBy: { lastConnectedAt: "desc" },
    });

    // Deduplicate by normalized lowercase email
    const accountMap = new Map<
      string,
      {
        email: string;
        folderName: string | null;
        folderId: string | null;
        lastConnectedAt: Date | null;
        isCurrentlyActive: boolean;
      }
    >();

    // 1. If primary is actively connected, register it first as the active account
    if (primary?.accountEmail && primary.isConnected) {
      const primaryClean = primary.accountEmail.trim().toLowerCase();
      accountMap.set(primaryClean, {
        email: primary.accountEmail,
        folderName: primary.folderName,
        folderId: primary.folderId,
        lastConnectedAt: primary.lastConnectedAt,
        isCurrentlyActive: true,
      });
    }

    // 2. Add saved history accounts
    for (const record of historyRecords) {
      if (record.accountEmail) {
        const cleanEmail = record.accountEmail.trim().toLowerCase();
        if (!accountMap.has(cleanEmail)) {
          accountMap.set(cleanEmail, {
            email: record.accountEmail,
            folderName: record.folderName,
            folderId: record.folderId,
            lastConnectedAt: record.lastConnectedAt,
            isCurrentlyActive:
              Boolean(primary?.isConnected) &&
              primary?.accountEmail?.trim().toLowerCase() === cleanEmail,
          });
        }
      }
    }

    return { success: true, accounts: Array.from(accountMap.values()) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load accounts";
    return { success: false, error: message, accounts: [] };
  }
}

export async function switchActiveDriveAccountAction(targetEmail: string) {
  const admin = await requireAdmin();
  try {
    const cleanEmail = (targetEmail || "").trim().toLowerCase();
    const target =
      (await prisma.googleDriveIntegration.findFirst({
        where: {
          accountEmail: { equals: cleanEmail, mode: "insensitive" },
          id: { startsWith: "account_" },
        },
      })) ||
      (await prisma.googleDriveIntegration.findFirst({
        where: { accountEmail: { equals: cleanEmail, mode: "insensitive" } },
      }));

    if (!target) {
      return { success: false, error: `Account ${targetEmail} not found in saved records` };
    }

    await prisma.googleDriveIntegration.upsert({
      where: { id: "primary" },
      update: {
        isConnected: true,
        accountEmail: target.accountEmail,
        accessToken: target.accessToken,
        refreshToken: target.refreshToken,
        tokenExpiry: target.tokenExpiry,
        folderId: target.folderId,
        folderName: target.folderName,
        scope: target.scope,
        lastConnectedAt: new Date(),
      },
      create: {
        id: "primary",
        isConnected: true,
        accountEmail: target.accountEmail,
        accessToken: target.accessToken,
        refreshToken: target.refreshToken,
        tokenExpiry: target.tokenExpiry,
        folderId: target.folderId,
        folderName: target.folderName,
        scope: target.scope,
        lastConnectedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "GOOGLE_DRIVE_ACCOUNT_SWITCHED",
        entityType: "INTEGRATION",
        entityId: targetEmail,
        metadata: { accountEmail: targetEmail },
      },
    });

    revalidatePath("/admin/settings/integrations/google-drive");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to switch account";
    return { success: false, error: message };
  }
}

export async function removeSavedDriveAccountAction(targetEmail: string) {
  const admin = await requireAdmin();
  try {
    const cleanEmail = (targetEmail || "").trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Invalid email address" };
    }

    // 1. Delete all history records matching this email
    await prisma.googleDriveIntegration.deleteMany({
      where: {
        OR: [
          { id: `account_${targetEmail.trim()}` },
          { id: `account_${cleanEmail}` },
          {
            accountEmail: { equals: cleanEmail, mode: "insensitive" },
            id: { not: "primary" },
          },
        ],
      },
    });

    // 2. If the primary integration (active or disconnected) points to this email, clear it completely
    const primary = await prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    });
    if (primary?.accountEmail && primary.accountEmail.trim().toLowerCase() === cleanEmail) {
      await prisma.googleDriveIntegration.update({
        where: { id: "primary" },
        data: {
          isConnected: false,
          accountEmail: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          folderId: null,
          folderName: null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "GOOGLE_DRIVE_ACCOUNT_REMOVED",
        entityType: "INTEGRATION",
        entityId: cleanEmail,
        metadata: { accountEmail: cleanEmail },
      },
    });

    revalidatePath("/admin/settings/integrations/google-drive");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove account";
    return { success: false, error: message };
  }
}


