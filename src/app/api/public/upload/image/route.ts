import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = (formData.get("fieldKey") as string) || "image";
    const uploadSessionToken = (formData.get("sessionToken") as string) || nanoid(24);

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: JPEG, PNG, WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Prepare local storage directory: public/user-uploads/images/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const relativeDir = path.join("user-uploads", "images", year, month);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(absoluteDir, { recursive: true });

    // Determine extension
    let ext = ".jpg";
    if (file.type === "image/png") ext = ".png";
    if (file.type === "image/webp") ext = ".webp";

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
        mimeType: file.type,
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

