import { prisma } from "@/lib/db/prisma";
import { CampaignStatus, RecipientDeliveryStatus } from "@prisma/client";
import { getEmailTransporter } from "./client";
import { renderEmailTemplate, EmailRenderContext } from "./variables";
import { wrapInFormSuiteEmailLayout } from "./html-wrapper";
import { formatNepalTime } from "@/lib/utils/timezone";

// Rate limiting & batch defaults
const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_BATCH_SIZE || 20);
const THROTTLE_DELAY_MS = Number(process.env.EMAIL_THROTTLE_MS || 150);
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Checks whether an SMTP or delivery error is permanent (no point retrying)
 * or temporary (safe to retry with exponential backoff).
 */
export function isPermanentEmailError(err: any): boolean {
  if (!err) return false;
  const message = String(err.message || "").toLowerCase();
  const code = String(err.responseCode || err.code || "");

  // Permanent SMTP status codes: 500-559
  if (/^5\d\d/.test(code)) return true;

  if (
    message.includes("no such user") ||
    message.includes("user unknown") ||
    message.includes("mailbox unavailable") ||
    message.includes("invalid address") ||
    message.includes("recipient rejected") ||
    message.includes("syntax error")
  ) {
    return true;
  }

  return false;
}

/**
 * Simple async delay for throttling
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Processes a single batch of recipients across active campaigns.
 * Can be called by Vercel Cron, external webhook, or background worker loop.
 */
export async function processNextCampaignBatch(
  workerId = `worker-${Math.random().toString(36).substring(2, 7)}`,
  batchSize = DEFAULT_BATCH_SIZE
): Promise<{
  processedCount: number;
  hasMore: boolean;
  campaignId: string | null;
}> {
  const now = new Date();
  const staleLockThreshold = new Date(now.getTime() - LOCK_TIMEOUT_MS);

  // 1. Find the oldest active campaign that is ready to process
  const activeCampaign = await prisma.emailCampaign.findFirst({
    where: {
      status: { in: [CampaignStatus.QUEUED, CampaignStatus.PROCESSING] },
      OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
    },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          eventDate: true,
          eventVenue: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!activeCampaign) {
    return { processedCount: 0, hasMore: false, campaignId: null };
  }

  // Ensure campaign status is marked PROCESSING
  if (activeCampaign.status !== CampaignStatus.PROCESSING) {
    await prisma.emailCampaign.update({
      where: { id: activeCampaign.id },
      data: {
        status: CampaignStatus.PROCESSING,
        startedAt: activeCampaign.startedAt || now,
      },
    });
  }

  // 2. Fetch up to batchSize eligible recipients
  // Eligible: QUEUED, or FAILED with attempts < maxAttempts and nextRetryAt <= now
  // AND either not locked, or lock is stale (> 5 mins old)
  const candidateRecipients = await prisma.emailCampaignRecipient.findMany({
    where: {
      campaignId: activeCampaign.id,
      OR: [
        { status: RecipientDeliveryStatus.QUEUED },
        {
          status: RecipientDeliveryStatus.FAILED,
          attemptCount: { lt: 3 },
          OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
        },
      ],
      AND: [
        {
          OR: [{ lockedAt: null }, { lockedAt: { lte: staleLockThreshold } }],
        },
      ],
    },
    include: {
      registration: {
        include: {
          answers: true,
        },
      },
    },
    take: batchSize,
    orderBy: { createdAt: "asc" },
  });

  if (candidateRecipients.length === 0) {
    // Check if the campaign is completely finished
    const remainingPending = await prisma.emailCampaignRecipient.count({
      where: {
        campaignId: activeCampaign.id,
        status: { in: [RecipientDeliveryStatus.QUEUED, RecipientDeliveryStatus.PROCESSING] },
      },
    });

    const retryableFailures = await prisma.emailCampaignRecipient.count({
      where: {
        campaignId: activeCampaign.id,
        status: RecipientDeliveryStatus.FAILED,
        attemptCount: { lt: 3 },
      },
    });

    if (remainingPending === 0 && retryableFailures === 0) {
      // Campaign finished!
      await prisma.emailCampaign.update({
        where: { id: activeCampaign.id },
        data: {
          status: CampaignStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await prisma.emailDeliveryLog.create({
        data: {
          campaignId: activeCampaign.id,
          email: "system@formsuite.local",
          event: "CAMPAIGN_COMPLETED",
          details: `Campaign finished: ${activeCampaign.sentCount} sent, ${activeCampaign.failedCount} failed, ${activeCampaign.skippedCount} skipped.`,
        },
      });
    }

    return { processedCount: 0, hasMore: false, campaignId: activeCampaign.id };
  }

  // 3. Atomically lock candidate recipients for this worker
  const recipientIds = candidateRecipients.map((r) => r.id);
  await prisma.emailCampaignRecipient.updateMany({
    where: {
      id: { in: recipientIds },
    },
    data: {
      status: RecipientDeliveryStatus.PROCESSING,
      lockedAt: now,
      lockedBy: workerId,
    },
  });

  // 4. Process each recipient sequentially or with light throttling
  const transporter = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "FormSuite";
  const fromEmail = process.env.EMAIL_FROM || "neosparknepal@gmail.com";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  let successfulBatchSends = 0;
  let failedBatchSends = 0;

  for (const recipient of candidateRecipients) {
    const reg = recipient.registration;
    const attemptNum = recipient.attemptCount + 1;

    // Check if recipient unsubscribed after campaign was created
    const isUnsubscribed = await prisma.emailUnsubscribe.findFirst({
      where: {
        email: recipient.email.toLowerCase().trim(),
        OR: [{ formId: activeCampaign.formId }, { formId: null }],
      },
    });

    if (isUnsubscribed) {
      await prisma.emailCampaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: RecipientDeliveryStatus.SKIPPED,
          lastError: "Participant unsubscribed from email communications",
          lockedAt: null,
          lockedBy: null,
        },
      });
      await prisma.emailCampaign.update({
        where: { id: activeCampaign.id },
        data: { skippedCount: { increment: 1 } },
      });
      continue;
    }

    // Extract participant category from answers
    let participantCategory = "General";
    if (reg?.answers) {
      for (const ans of reg.answers) {
        if (
          ans.fieldKey.toLowerCase().includes("category") ||
          ans.fieldLabel.toLowerCase().includes("category") ||
          ans.fieldKey.toLowerCase().includes("race")
        ) {
          if (typeof ans.value === "string") {
            participantCategory = ans.value;
          } else if (ans.value && typeof ans.value === "object" && "label" in ans.value) {
            participantCategory = String((ans.value as any).label);
          }
          break;
        }
      }
    }

    // Prepare contextual variables
    const eventDateStr = activeCampaign.form.eventDate
      ? formatNepalTime(activeCampaign.form.eventDate, "MMMM dd, yyyy")
      : "To Be Announced";

    const eventTimeStr = activeCampaign.form.eventDate
      ? formatNepalTime(activeCampaign.form.eventDate, "hh:mm a 'NPT'")
      : "06:30 AM NPT";

    const unsubscribeToken = Buffer.from(`${recipient.email}:${activeCampaign.formId}`).toString("base64url");
    const unsubscribeUrl = `${appUrl}/unsubscribe?token=${unsubscribeToken}`;

    const context: EmailRenderContext = {
      participant_name: recipient.fullName || "Participant",
      participant_email: recipient.email,
      registration_id: reg?.referenceNumber || "FC-REGISTERED",
      event_name: activeCampaign.form.name,
      event_date: eventDateStr,
      event_time: eventTimeStr,
      event_venue: activeCampaign.form.eventVenue || "To Be Announced",
      event_location: activeCampaign.form.eventVenue || "Nepal",
      event_description: activeCampaign.form.description || activeCampaign.form.name,
      participant_category: participantCategory,
      organizer_name: `${activeCampaign.form.name} Organizing Committee`,
      registration_url: `${appUrl}/register/${activeCampaign.form.slug}`,
      event_url: `${appUrl}/register/${activeCampaign.form.slug}`,
      current_date: formatNepalTime(new Date(), "MMMM dd, yyyy"),
      unsubscribe_url: unsubscribeUrl,
    };

    // Render personalized subject & body
    const renderedSubject = renderEmailTemplate(activeCampaign.subject, context, { isHtml: false });
    const renderedBody = renderEmailTemplate(activeCampaign.content, context, { isHtml: true });

    const finalHtml = wrapInFormSuiteEmailLayout({
      eventTitle: activeCampaign.form.name,
      badgeText: "Participant Notification",
      bodyHtml: renderedBody,
      unsubscribeUrl,
      showUnsubscribe: true,
    });

    try {
      // Send email via transporter
      const sendResult = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient.email,
        subject: renderedSubject,
        html: finalHtml,
      });

      // Mark recipient as SENT
      await prisma.emailCampaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: RecipientDeliveryStatus.SENT,
          sentAt: new Date(),
          providerMessageId: sendResult.messageId || null,
          lastError: null,
          lockedAt: null,
          lockedBy: null,
        },
      });

      successfulBatchSends++;

      // Log success
      await prisma.emailDeliveryLog.create({
        data: {
          campaignId: activeCampaign.id,
          recipientId: recipient.id,
          registrationId: recipient.registrationId,
          email: recipient.email,
          event: "SENT",
          details: `Sent successfully. Provider message ID: ${sendResult.messageId || "N/A"}`,
        },
      });
    } catch (err: any) {
      failedBatchSends++;
      const isPermanent = isPermanentEmailError(err);
      const isFinalAttempt = attemptNum >= recipient.maxAttempts || isPermanent;

      // Exponential backoff for temporary failures: 2^attempt * 60 seconds
      const backoffSeconds = Math.pow(2, attemptNum) * 60;
      const nextRetryAt = isFinalAttempt ? null : new Date(Date.now() + backoffSeconds * 1000);

      const errorMessage = String(err.message || err.toString()).substring(0, 500);

      await prisma.emailCampaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: isFinalAttempt ? RecipientDeliveryStatus.FAILED : RecipientDeliveryStatus.FAILED,
          attemptCount: attemptNum,
          nextRetryAt,
          lastError: errorMessage,
          lockedAt: null,
          lockedBy: null,
        },
      });

      // Log failure
      await prisma.emailDeliveryLog.create({
        data: {
          campaignId: activeCampaign.id,
          recipientId: recipient.id,
          registrationId: recipient.registrationId,
          email: recipient.email,
          event: isFinalAttempt ? "FAILED_PERMANENT" : "ATTEMPT_FAILED",
          details: `Attempt ${attemptNum} failed: ${errorMessage}${nextRetryAt ? ` (Next retry at: ${nextRetryAt.toISOString()})` : ""}`,
        },
      });
    }

    // Rate throttle delay between individual recipient sends
    if (THROTTLE_DELAY_MS > 0) {
      await delay(THROTTLE_DELAY_MS);
    }
  }

  // 5. Update overall campaign counters
  await prisma.emailCampaign.update({
    where: { id: activeCampaign.id },
    data: {
      sentCount: { increment: successfulBatchSends },
      failedCount: { increment: failedBatchSends },
    },
  });

  return {
    processedCount: candidateRecipients.length,
    hasMore: true,
    campaignId: activeCampaign.id,
  };
}

/**
 * Triggers an asynchronous in-process worker cycle in the background.
 * Processes batches until no more items or until maxBatches limit is reached.
 * Never blocks API / UI requests.
 */
export function triggerBackgroundWorker(maxBatches = 10) {
  // Execute asynchronously without awaiting
  (async () => {
    try {
      let batchesRun = 0;
      let hasMore = true;

      while (hasMore && batchesRun < maxBatches) {
        const result = await processNextCampaignBatch();
        hasMore = result.hasMore && result.processedCount > 0;
        batchesRun++;

        if (hasMore) {
          await delay(200); // breather between batches
        }
      }
    } catch (e) {
      console.error("[EmailWorker] Background processing error:", e);
    }
  })();
}
