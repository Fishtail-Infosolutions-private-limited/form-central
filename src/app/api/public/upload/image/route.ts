import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { deletePhysicalFile } from "@/lib/storage/cleanup";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = (formData.get("fieldKey") as string) || "image";
    const uploadSessionToken = (formData.get("sessionToken") as string) || nanoid(24);
    const previousFileId = (formData.get("previousFileId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const isValidImage =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|avif|svg|bmp|tiff?|heic|heif)$/i.test(file.name);

    if (!isValidImage) {
      return NextResponse.json(
        { error: "Invalid image format. Supported: JPEG, PNG, WebP, GIF, AVIF, SVG, BMP, HEIC." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Clean up previously replaced file if provided or pending in this session
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

    // Prepare local storage directory: public/user-uploads/images/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const relativeDir = path.join("user-uploads", "images", year, month);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(absoluteDir, { recursive: true });

    // Determine extension
    const nameExt = path.extname(file.name).toLowerCase();
    let ext = nameExt && nameExt.length > 1 ? nameExt : ".jpg";
    if (!nameExt) {
      if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/gif") ext = ".gif";
      else if (file.type === "image/avif") ext = ".avif";
      else if (file.type === "image/svg+xml") ext = ".svg";
    }

    const uniqueFilename = `${nanoid(16)}${ext}`;
    const absoluteFilePath = path.join(absoluteDir, uniqueFilename);
    const publicUrl = `/${relativeDir.replace(/\\/g, "/")}/${uniqueFilename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absoluteFilePath, buffer);

    // Save record in PostgreSQL
    const uploadedRecord = await prisma.uploadedFile.create({
      data: {
        fieldKey,
        originalName: file.name,
        storageProvider: "LOCAL",
        storagePath: publicUrl,
        mimeType: file.type || "image/jpeg",
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
    console.error("Image upload failed:", err);
    return NextResponse.json(
      { error: "Internal server error during image upload" },
      { status: 500 }
    );
  }
}
