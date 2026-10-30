import { promises as fs } from "fs";
import path from "path";
import { deleteDriveFile } from "@/lib/google-drive/client";

interface FileToDelete {
  storageProvider: string;
  storagePath: string;
  driveFileId?: string | null;
}

export async function deletePhysicalFile(file: FileToDelete): Promise<boolean> {
  try {
    if (file.storageProvider === "GOOGLE_DRIVE" && file.driveFileId) {
      await deleteDriveFile(file.driveFileId);
      return true;
    }

    if (file.storageProvider === "LOCAL" && file.storagePath) {
      // Local file: path is e.g. /user-uploads/images/2026/10/file.jpg
      const relative = file.storagePath.startsWith("/")
        ? file.storagePath.slice(1)
        : file.storagePath;
      const absolute = path.join(process.cwd(), "public", relative);
      await fs.unlink(absolute).catch(() => {});
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Error deleting physical file:", err);
    return false;
  }
}

export async function deleteMultiplePhysicalFiles(files: FileToDelete[]): Promise<void> {
  await Promise.allSettled(files.map((f) => deletePhysicalFile(f)));
}
