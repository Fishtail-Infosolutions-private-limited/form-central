"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  createAndEnqueueCampaign,
  resolveEligibleRecipients,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  retryFailedRecipients,
  RecipientCriteria,
} from "@/lib/email/queue";
import { triggerBackgroundWorker } from "@/lib/email/worker";
import { getEmailTransporter } from "@/lib/email/client";
import { renderEmailTemplate, getSamplePreviewContext, validateTemplateVariables } from "@/lib/email/variables";
import { wrapInFormSuiteEmailLayout } from "@/lib/email/html-wrapper";
import { parseNepalTimeToUtc } from "@/lib/utils/timezone";
import { revalidatePath } from "next/cache";

/**
 * Estimates the recipient count for a selected form and criteria.
 */
export async function estimateRecipientsAction(formId: string, criteria: RecipientCriteria) {
  await requireAdmin();
  try {
    const recipients = await resolveEligibleRecipients(formId, criteria);
    return {
      success: true,
      count: recipients.length,
      sampleNames: recipients.slice(0, 5).map((r) => `${r.fullName} (${r.email})`),
    };
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      sampleNames: [],
      error: error.message || "Failed to estimate recipients",
    };
  }
}

/**
 * Sends a test email to the administrator before launching the actual campaign.
 */
export async function sendTestEmailAction({
  formId,
  subject,
  content,
  testEmail,
}: {
  formId: string;
  subject: string;
  content: string;
  testEmail: string;
}) {
  const admin = await requireAdmin();

  if (!testEmail || !testEmail.includes("@")) {
    return { success: false, error: "Please provide a valid test email address." };
  }

  try {
    const form = await prisma.registrationForm.findUnique({
      where: { id: formId },
    });

    const sampleContext = getSamplePreviewContext({
      event_name: form?.name || "Pokhara City Run 2026",
      event_description: form?.description || "Official Running Event",
      participant_name: admin.name || "Test Administrator",
      participant_email: testEmail,
    });

    const renderedSubject = `[TEST] ${renderEmailTemplate(subject, sampleContext, { isHtml: false })}`;
    const renderedBody = renderEmailTemplate(content, sampleContext, { isHtml: true });

    const finalHtml = wrapInFormSuiteEmailLayout({
      eventTitle: form?.name || "FormSuite Test",
      badgeText: "Internal Test Preview",
      bodyHtml: `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600;">
            This is a test preview email sent to <strong>${testEmail}</strong>. Dynamic variables have been populated with sample data.
          </p>
        </div>
        ${renderedBody}
      `,
      showUnsubscribe: false,
    });

    const transporter = getEmailTransporter();
    const fromName = process.env.EMAIL_FROM_NAME || "FormSuite";
    const fromEmail = process.env.EMAIL_FROM || "neosparknepal@gmail.com";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: testEmail,
      subject: renderedSubject,
      html: finalHtml,
    });

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to send test email. Please check your SMTP settings.",
    };
  }
}

/**
 * Creates and enqueues a new bulk email campaign.
 */
export async function createCampaignAction({
  name,
  formId,
  templateId,
  subject,
  content,
  criteria,
  sendOption,
  scheduledDate,
  scheduledTime,
}: {
  name: string;
  formId: string;
  templateId?: string;
  subject: string;
  content: string;
  criteria: RecipientCriteria;
  sendOption: "immediate" | "scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
}) {
  const admin = await requireAdmin();

  if (!name.trim()) return { success: false, error: "Campaign name is required." };
  if (!formId) return { success: false, error: "Please select an event / form." };
  if (!subject.trim()) return { success: false, error: "Email subject is required." };
  if (!content.trim()) return { success: false, error: "Email content is required." };

  // Validate template variable syntax
  const subjectValidation = validateTemplateVariables(subject);
  const contentValidation = validateTemplateVariables(content);
  if (!subjectValidation.valid || !contentValidation.valid) {
    const warnings = [...subjectValidation.warnings, ...contentValidation.warnings];
    return {
      success: false,
      error: `Variable syntax error: ${warnings.join(", ")}`,
    };
  }

  let scheduledAt: Date | null = null;
  if (sendOption === "scheduled") {
    if (!scheduledDate) {
      return { success: false, error: "Scheduled date is required for scheduled campaigns." };
    }
    const timeVal = scheduledTime || "08:00";
    scheduledAt = parseNepalTimeToUtc(scheduledDate, timeVal);
    if (!scheduledAt || isNaN(scheduledAt.getTime())) {
      return { success: false, error: "Invalid scheduled date or time." };
    }
  }

  try {
    const campaign = await createAndEnqueueCampaign({
      name: name.trim(),
      formId,
      templateId,
      subject: subject.trim(),
      content: content.trim(),
      criteria,
      scheduledAt,
      createdById: admin.id,
    });

    // If immediate, trigger worker asynchronously so delivery begins right away
    if (sendOption === "immediate") {
      triggerBackgroundWorker();
    }

    revalidatePath("/admin/campaigns");
    return { success: true, campaignId: campaign.id };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create campaign.",
    };
  }
}

/**
 * Pauses an active or queued campaign.
 */
export async function pauseCampaignAction(campaignId: string) {
  await requireAdmin();
  try {
    await pauseCampaign(campaignId);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to pause campaign" };
  }
}

/**
 * Resumes a paused campaign.
 */
export async function resumeCampaignAction(campaignId: string) {
  await requireAdmin();
  try {
    await resumeCampaign(campaignId);
    triggerBackgroundWorker();
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to resume campaign" };
  }
}

/**
 * Cancels a campaign.
 */
export async function cancelCampaignAction(campaignId: string) {
  await requireAdmin();
  try {
    await cancelCampaign(campaignId);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel campaign" };
  }
}

/**
 * Retries all failed recipients in a campaign.
 */
export async function retryFailedRecipientsAction(campaignId: string) {
  await requireAdmin();
  try {
    const count = await retryFailedRecipients(campaignId);
    triggerBackgroundWorker();
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin/campaigns");
    return { success: true, retriedCount: count };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to retry recipients" };
  }
}

/**
 * Gets real-time campaign progress and recipient summary.
 */
export async function getCampaignProgressAction(campaignId: string) {
  await requireAdmin();
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
        skippedCount: true,
        startedAt: true,
        completedAt: true,
      },
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    const processed = campaign.sentCount + campaign.failedCount + campaign.skippedCount;
    const percentage = campaign.totalRecipients > 0 ? Math.round((processed / campaign.totalRecipients) * 100) : 0;

    return {
      success: true,
      campaign: {
        ...campaign,
        processed,
        percentage,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load progress" };
  }
}

