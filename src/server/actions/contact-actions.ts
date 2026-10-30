"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export interface ContactInquiryInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Public action to submit a contact inquiry with IP and email rate limiting (max 4 per 24 hours).
 */
export async function submitContactInquiryAction(input: ContactInquiryInput) {
  try {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const subject = input.subject?.trim() || null;
    const message = input.message?.trim();

    if (!name || name.length < 2) {
      return { success: false, error: "Please enter your full name (minimum 2 characters)." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (!message || message.length < 5) {
      return { success: false, error: "Please enter a message (minimum 5 characters)." };
    }

    // Determine client IP address
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";

    // Rate Limiting: Max 4 submissions per IP or Email in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingCount = await prisma.contactInquiry.count({
      where: {
        OR: [
          { ipAddress: clientIp },
          { email: email },
        ],
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (existingCount >= 4) {
      return {
        success: false,
        error: "Submission limit reached (maximum 4 inquiries per day). To prevent automated spam, further submissions are restricted. Please contact our leadership directly via phone or WhatsApp.",
      };
    }

    // Save inquiry to database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: clientIp,
        isRead: false,
      },
    });

    return {
      success: true,
      inquiryId: inquiry.id,
      message: "Thank you! Your message has been received by The Origin Foundation administration.",
    };
  } catch (err: unknown) {
    console.error("Submit contact inquiry error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.",
    };
  }
}

/**
 * Admin action to mark an inquiry as read or unread.
 */
export async function toggleContactInquiryReadAction(id: string, isRead: boolean) {
  await requireAdmin();
  try {
    await prisma.contactInquiry.update({
      where: { id },
      data: { isRead },
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: "Failed to update inquiry." };
  }
}

/**
 * Admin action to delete an inquiry.
 */
export async function deleteContactInquiryAction(id: string) {
  await requireAdmin();
  try {
    await prisma.contactInquiry.delete({
      where: { id },
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: "Failed to delete inquiry." };
  }
}
