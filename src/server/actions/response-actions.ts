"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { SubmissionStatus } from "@prisma/client";
import { sendParticipantEmailNotice } from "@/lib/email/client";

export async function toggleSubmissionReadStatusAction(submissionId: string) {
  const admin = await requireAdmin();

  const current = await prisma.registrationSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true },
  });

  if (!current) {
    return { success: false, error: "Submission not found" };
  }

  // Toggle between Read (APPROVED) and Unread (PENDING)
  const nextStatus: SubmissionStatus =
    current.status === SubmissionStatus.APPROVED
      ? SubmissionStatus.PENDING
      : SubmissionStatus.APPROVED;

  const submission = await prisma.registrationSubmission.update({
    where: { id: submissionId },
    data: { status: nextStatus },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: `SUBMISSION_TOGGLE_${nextStatus}`,
      entityType: "SUBMISSION",
      entityId: submissionId,
      metadata: { newStatus: nextStatus },
    },
  });

  revalidatePath("/admin/responses");
  revalidatePath("/admin/dashboard");
  return { success: true, submission, isRead: nextStatus === SubmissionStatus.APPROVED };
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  newStatus: SubmissionStatus
) {
  const admin = await requireAdmin();

  const submission = await prisma.registrationSubmission.update({
    where: { id: submissionId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: `SUBMISSION_STATUS_${newStatus}`,
      entityType: "SUBMISSION",
      entityId: submissionId,
      metadata: { newStatus },
    },
  });

  revalidatePath("/admin/responses");
  revalidatePath("/admin/dashboard");
  return { success: true, submission };
}

export async function sendRegistrationEmailNoticeAction({
  submissionId,
  subject,
  messageText,
}: {
  submissionId: string;
  subject: string;
  messageText: string;
}) {
  const admin = await requireAdmin();

  if (!subject.trim() || !messageText.trim()) {
    return { success: false, error: "Subject and message content are required" };
  }

  const submission = await prisma.registrationSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        select: { name: true },
      },
    },
  });

  if (!submission) {
    return { success: false, error: "Participant submission record not found" };
  }

  try {
    await sendParticipantEmailNotice({
      to: submission.email,
      recipientName: submission.fullName,
      formName: submission.form.name,
      subject: subject.trim(),
      messageText: messageText.trim(),
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "SENT_PARTICIPANT_NOTICE",
        entityType: "SUBMISSION",
        entityId: submissionId,
        metadata: {
          recipientEmail: submission.email,
          subject,
        },
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send participant notice:", err);
    return {
      success: false,
      error: err.message || "Failed to deliver email through SMTP server",
    };
  }
}
