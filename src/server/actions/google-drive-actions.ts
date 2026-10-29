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

    const allRecords = await prisma.googleDriveIntegration.findMany({
      where: {
        accountEmail: { not: null },
      },
      orderBy: { lastConnectedAt: "desc" },
    });

    // Deduplicate by email
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

    if (primary?.accountEmail && primary.isConnected) {
      accountMap.set(primary.accountEmail, {
        email: primary.accountEmail,
        folderName: primary.folderName,
        folderId: primary.folderId,
        lastConnectedAt: primary.lastConnectedAt,
        isCurrentlyActive: true,
      });
    }

    for (const record of allRecords) {
      if (record.accountEmail && !accountMap.has(record.accountEmail)) {
        accountMap.set(record.accountEmail, {
          email: record.accountEmail,
          folderName: record.folderName,
          folderId: record.folderId,
          lastConnectedAt: record.lastConnectedAt,
          isCurrentlyActive:
            primary?.accountEmail === record.accountEmail && Boolean(primary?.isConnected),
        });
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
    const target =
      (await prisma.googleDriveIntegration.findFirst({
        where: {
          accountEmail: targetEmail,
          id: { startsWith: "account_" },
        },
      })) ||
      (await prisma.googleDriveIntegration.findFirst({
        where: { accountEmail: targetEmail },
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
    await prisma.googleDriveIntegration.deleteMany({
      where: {
        id: `account_${targetEmail}`,
      },
    });

    // If removing the currently active account, disconnect primary
    const primary = await prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    });
    if (primary?.accountEmail === targetEmail) {
      await disconnectDrive();
    }

    revalidatePath("/admin/settings/integrations/google-drive");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove account";
    return { success: false, error: message };
  }
}


