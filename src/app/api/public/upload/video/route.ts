import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { uploadVideoToDrive, getAuthenticatedDriveClient } from "@/lib/google-drive/client";
import { deletePhysicalFile } from "@/lib/storage/cleanup";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/ogg",
];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = (formData.get("fieldKey") as string) || "video";
    const uploadSessionToken = (formData.get("sessionToken") as string) || nanoid(24);
    const previousFileId = (formData.get("previousFileId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const isValidVideo =
      ALLOWED_VIDEO_TYPES.includes(file.type) ||
      file.type.startsWith("video/") ||
      /\.(mp4|webm|mov|avi|m4v|mkv|ogg)$/i.test(file.name);

    if (!isValidVideo) {
      return NextResponse.json(
        { error: "Invalid video format. Supported formats: MP4, WebM, QuickTime (MOV)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `Video "${file.name}" is ${sizeMb} MB, which exceeds the maximum allowed 100 MB limit.` },
        { status: 400 }
      );
    }

    // Clean up previously replaced video if provided or pending in this session
    if (previousFileId) {
      const oldFile = await prisma.uploadedFile.findUnique({ where: { id: previousFileId } });
      if (oldFile) {
        await deletePhysicalFile(oldFile);
        await prisma.uploadedFile.delete({ where: { id: previousFileId } }).catch(() => {});
      }
    } else if (uploadSessionToken && fieldKey) {
      const pendingFiles = await prisma.uploadedFile.findMany({
        where: {
          uploadSessionToken,
          fieldKey,
          status: "PENDING",
        },
      });
      for (const pf of pendingFiles) {
        await deletePhysicalFile(pf);
        await prisma.uploadedFile.delete({ where: { id: pf.id } }).catch(() => {});
      }
    }

    // Check Google Drive configuration
    let driveAuth = null;
    try {
      driveAuth = await getAuthenticatedDriveClient();
    } catch {
      driveAuth = null;
    }

    const hasDrive = Boolean(driveAuth?.integration?.isConnected && driveAuth?.integration?.folderId);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (hasDrive && driveAuth?.integration?.folderId) {
      // Upload to Google Drive API v3
      const sanitizedName = `video_${nanoid(8)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const driveFile = await uploadVideoToDrive(
        buffer,
        sanitizedName,
        file.type,
        driveAuth.integration.folderId
      );

      if (driveFile?.id) {
        const driveUrl = `https://drive.google.com/file/d/${driveFile.id}/view`;
        const uploadedRecord = await prisma.uploadedFile.create({
          data: {
            fieldKey,
            originalName: file.name,
            storageProvider: "GOOGLE_DRIVE",
            storagePath: driveUrl,
            driveFileId: driveFile.id,
            mimeType: file.type || "video/mp4",
            fileSize: file.size,
            uploadSessionToken,
            status: "PENDING",
          },
        });

        return NextResponse.json({
          success: true,
          fileId: uploadedRecord.id,
          url: driveUrl,
          driveFileId: driveFile.id,
          filename: file.name,
          fileSize: file.size,
        });
      }
    }

    // Local Disk Fallback: public/user-uploads/videos/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const relativeDir = path.join("user-uploads", "videos", year, month);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(absoluteDir, { recursive: true });

    const nameExt = path.extname(file.name).toLowerCase();
    const ext = nameExt && nameExt.length > 1 ? nameExt : ".mp4";
    const uniqueFilename = `${nanoid(16)}${ext}`;
    const absoluteFilePath = path.join(absoluteDir, uniqueFilename);
    const publicUrl = `/${relativeDir.replace(/\\/g, "/")}/${uniqueFilename}`;

    await fs.writeFile(absoluteFilePath, buffer);

    const uploadedRecord = await prisma.uploadedFile.create({
      data: {
        fieldKey,
        originalName: file.name,
        storageProvider: "LOCAL",
        storagePath: publicUrl,
        mimeType: file.type || "video/mp4",
        fileSize: file.size,
        uploadSessionToken,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedRecord.id,
      url: publicUrl,
      filename: file.name,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    console.error("Video upload failed:", err);
    return NextResponse.json(
      { error: "Internal server error during video upload" },
      { status: 500 }
    );
  }
}
