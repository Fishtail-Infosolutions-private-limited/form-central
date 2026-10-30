import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { uploadVideoToDrive, getAuthenticatedDriveClient } from "@/lib/google-drive/client";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = (formData.get("fieldKey") as string) || "video";
    const uploadSessionToken = (formData.get("sessionToken") as string) || nanoid(24);

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid video format. Supported formats: MP4, WebM, QuickTime (MOV)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Video exceeds maximum 100MB file size limit." },
        { status: 400 }
      );
    }

    // Check Google Drive configuration
    const driveAuth = await getAuthenticatedDriveClient();
    if (!driveAuth || !driveAuth.integration.isConnected) {
      return NextResponse.json(
        {
          error:
            "Google Drive video storage is not currently connected by the event administrator. Please contact event support.",
        },
        { status: 503 }
      );
    }

    if (!driveAuth.integration.folderId) {
      return NextResponse.json(
        {
          error:
            "No Google Drive destination folder has been configured by the event administrator.",
        },
        { status: 503 }
      );
    }

    // Upload to Google Drive API v3
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = `video_submission_${nanoid(10)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const driveFile = await uploadVideoToDrive(
      buffer,
      sanitizedName,
      file.type,
      driveAuth.integration.folderId
    );

    if (!driveFile?.id) {
      return NextResponse.json(
        { error: "Failed to upload video to Google Drive. Please retry." },
        { status: 500 }
      );
    }

    // Persist upload metadata in PostgreSQL
    const uploadedRecord = await prisma.uploadedFile.create({
      data: {
        fieldKey,
        originalName: file.name,
        storageProvider: "GOOGLE_DRIVE",
        storagePath: driveFile.id,
        driveFileId: driveFile.id,
        mimeType: file.type,
        fileSize: file.size,
        uploadSessionToken,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedRecord.id,
      driveFileId: driveFile.id,
      filename: file.name,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    console.error("Video upload to Google Drive error:", err);
    const message = err instanceof Error ? err.message : "Internal error during video upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

