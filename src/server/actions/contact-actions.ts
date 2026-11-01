"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { sendInquiryReplyEmail } from "@/lib/email/client";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: "Failed to delete inquiry." };
  }
}

/**
 * Admin action to fetch all inquiries with search, filter, and stats.
 */
export async function getContactInquiriesAction({
  filter = "all",
  search = "",
}: {
  filter?: "all" | "unread" | "replied";
  search?: string;
} = {}) {
  await requireAdmin();
  try {
    const where: any = {};

    if (filter === "unread") {
      where.isRead = false;
      where.replyMessage = null;
    } else if (filter === "replied") {
      where.replyMessage = { not: null };
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { subject: { contains: search.trim(), mode: "insensitive" } },
        { message: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [inquiries, totalCount, unreadCount, repliedCount] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { isRead: false, replyMessage: null } }),
      prisma.contactInquiry.count({ where: { replyMessage: { not: null } } }),
    ]);

    return {
      success: true,
      inquiries,
      stats: {
        total: totalCount,
        unread: unreadCount,
        replied: repliedCount,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load inquiries.",
      inquiries: [],
      stats: { total: 0, unread: 0, replied: 0 },
    };
  }
}

/**
 * Admin action to directly send an email reply to an inquiry.
 */
export async function replyToContactInquiryAction({
  inquiryId,
  replySubject,
  replyMessage,
}: {
  inquiryId: string;
  replySubject: string;
  replyMessage: string;
}) {
  const admin = await requireAdmin();
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return { success: false, error: "Inquiry record not found." };
    }

    if (!replyMessage.trim()) {
      return { success: false, error: "Reply message cannot be empty." };
    }

    // 1. Dispatch email reply
    await sendInquiryReplyEmail({
      to: inquiry.email,
      recipientName: inquiry.name,
      originalSubject: inquiry.subject,
      originalMessage: inquiry.message,
      replySubject: replySubject.trim() || `Re: ${inquiry.subject || "The Origin Foundation Inquiry"}`,
      replyMessage: replyMessage.trim(),
      adminName: (admin as any).name || "The Origin Foundation Directorate",
    });

    // 2. Update record in database
    await prisma.contactInquiry.update({
      where: { id: inquiryId },
      data: {
        isRead: true,
        replyMessage: replyMessage.trim(),
        repliedAt: new Date(),
        repliedBy: (admin as any).name || (admin as any).email || "Event Administrator",
      },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Reply to inquiry error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email reply.",
    };
  }
}

