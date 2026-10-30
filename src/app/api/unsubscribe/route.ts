import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Missing unsubscribe token" }, { status: 400 });
    }

    let email = "";
    let formId: string | null = null;

    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const parts = decoded.split(":");
      email = parts[0]?.toLowerCase().trim();
      formId = parts[1] || null;
    } catch {
      return NextResponse.json({ error: "Malformed token" }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email in token" }, { status: 400 });
    }

    // Record unsubscribe preference
    const existing = await prisma.emailUnsubscribe.findFirst({
      where: {
        email,
        ...(formId ? { formId } : { formId: null }),
      },
    });

    if (existing) {
      await prisma.emailUnsubscribe.update({
        where: { id: existing.id },
        data: {
          reason: "User unsubscribed via email link",
        },
      });
    } else {
      await prisma.emailUnsubscribe.create({
        data: {
          email,
          formId,
          reason: "User unsubscribed via email link",
          token,
        },
      });
    }

    return NextResponse.json({ success: true, email });
  } catch (err: any) {
    console.error("[UnsubscribeAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to unsubscribe" }, { status: 500 });
  }
}
