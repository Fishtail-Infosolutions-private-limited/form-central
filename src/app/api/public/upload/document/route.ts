import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = (formData.get("fieldKey") as string) || "document";
    const uploadSessionToken = (formData.get("sessionToken") as string) || nanoid(24);

    if (!file) {
      return NextResponse.json({ error: "No document file provided" }, { status: 400 });
    }

    // Check MIME type or extension
    const isPdfOrDoc =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      file.name.toLowerCase().endsWith(".pdf") ||
      file.name.toLowerCase().endsWith(".doc") ||
      file.name.toLowerCase().endsWith(".docx");

    if (!isPdfOrDoc) {
      return NextResponse.json(
        { error: "Invalid document format. Allowed formats: PDF, DOC, DOCX." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Document file size exceeds the 25MB limit." },
        { status: 400 }
      );
    }

    // Prepare local storage directory: public/user-uploads/documents/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const relativeDir = path.join("user-uploads", "documents", year, month);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(absoluteDir, { recursive: true });

    // Determine extension
    let ext = ".pdf";
    if (file.name.toLowerCase().endsWith(".docx")) ext = ".docx";
    else if (file.name.toLowerCase().endsWith(".doc")) ext = ".doc";
    else if (file.name.toLowerCase().endsWith(".txt")) ext = ".txt";

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
        mimeType: file.type || "application/pdf",
        fileSize: file.size,
        uploadSessionToken,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedRecord.id,
      filename: file.name,
      url: publicUrl,
    });
  } catch (err: unknown) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: "Internal server error while saving document" },
      { status: 500 }
    );
  }
}
