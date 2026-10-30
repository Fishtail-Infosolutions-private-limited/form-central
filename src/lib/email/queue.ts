import { prisma } from "@/lib/db/prisma";
import { CampaignStatus, RecipientDeliveryStatus } from "@prisma/client";

export type ParticipantGroupFilter =
  | "ALL"
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "ACTION_REQUIRED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_PENDING";

export interface RecipientCriteria {
  // Targeting mode
  targetType?: "GROUP" | "MANUAL" | "COMBINED";
  // Option A: Mithila Queen participant group filter
  groupFilter?: ParticipantGroupFilter | null;
  // Option B: Specific manual emails
  manualEmails?: string[];
  // Legacy criteria support
  type?: "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CATEGORY" | "MANUAL" | "EXCLUDE_CAMPAIGN" | "COMMUNICATIONS";
  categoryValue?: string;
  categoryFieldKey?: string;
  manualIds?: string[];
  excludeCampaignId?: string;
  excludeUnsubscribed?: boolean;
}

export interface EligibleRecipient {
  registrationId?: string | null;
  email: string;
  fullName: string;
  referenceNumber: string;
  status: string;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Resolves eligible recipients for a communication campaign based on
 * Mithila Queen participants and optional manual email addresses.
 * Guarantees deduplication, excludes unsubscribed participants where applicable,
 * and maintains strict recipient privacy.
 */
export async function resolveEligibleRecipients(
  formId: string,
  criteria: RecipientCriteria
): Promise<EligibleRecipient[]> {
  const eligible: EligibleRecipient[] = [];
  const seenEmails = new Set<string>();

  // 1. Fetch unsubscribed emails for this form (or globally)
  const unsubscribes = await prisma.emailUnsubscribe.findMany({
    where: {
      OR: [{ formId }, { formId: null }],
    },
    select: { email: true },
  });
  const unsubscribedEmails = new Set(unsubscribes.map((u) => u.email.toLowerCase().trim()));

  // 2. Determine target filter
  const effectiveGroup = criteria.groupFilter || (criteria.type as ParticipantGroupFilter) || "ALL";
  const shouldIncludeGroup = criteria.targetType !== "MANUAL";
  const shouldIncludeManual = criteria.targetType === "MANUAL" || criteria.targetType === "COMBINED" || (criteria.manualEmails && criteria.manualEmails.length > 0);

  // 3. Query Mithila Queen Registrations if group targeting is active
  if (shouldIncludeGroup) {
    const mqWhere: any = {};

    if (effectiveGroup === "APPROVED") {
      mqWhere.applicationStatus = "APPROVED";
    } else if (effectiveGroup === "PENDING") {
      mqWhere.applicationStatus = { in: ["SUBMITTED", "UNDER_REVIEW"] };
    } else if (effectiveGroup === "REJECTED") {
      mqWhere.applicationStatus = "REJECTED";
    } else if (effectiveGroup === "ACTION_REQUIRED") {
      mqWhere.applicationStatus = "ACTION_REQUIRED";
    } else if (effectiveGroup === "PAYMENT_VERIFIED") {
      mqWhere.paymentStatus = "VERIFIED";
    } else if (effectiveGroup === "PAYMENT_PENDING") {
      mqWhere.paymentStatus = { in: ["PENDING", "UNDER_REVIEW", "CLARIFICATION_REQUIRED"] };
    }

    const mqRegistrations = await prisma.mithilaQueenRegistration.findMany({
      where: mqWhere,
      orderBy: { submittedAt: "desc" },
    });

    for (const app of mqRegistrations) {
      if (!app.email) continue;
      const normalizedEmail = app.email.toLowerCase().trim();

      // Check unsubscribe status
      if (criteria.excludeUnsubscribed !== false && unsubscribedEmails.has(normalizedEmail)) {
        continue;
      }

      if (!seenEmails.has(normalizedEmail)) {
        seenEmails.add(normalizedEmail);
        eligible.push({
          registrationId: null,
          email: app.email.trim(),
          fullName: app.fullName || "Mithila Queen Participant",
          referenceNumber: app.registrationId,
          status: app.applicationStatus,
          category: "Mithila Queen Contestant",
          metadata: {
            source: "MITHILA_QUEEN",
            referenceNumber: app.registrationId,
            paymentStatus: app.paymentStatus,
            applicationStatus: app.applicationStatus,
            isMinor: app.isMinor,
            district: app.district,
            province: app.province,
          },
        });
      }
    }

    // Also query generic RegistrationSubmission if any exist for this form
    const subWhere: any = { formId };
    if (effectiveGroup === "APPROVED") subWhere.status = "APPROVED";
    else if (effectiveGroup === "PENDING") subWhere.status = "PENDING";
    else if (effectiveGroup === "REJECTED") subWhere.status = "REJECTED";

    const submissions = await prisma.registrationSubmission.findMany({
      where: subWhere,
      include: { answers: true },
      orderBy: { submittedAt: "desc" },
    });

    for (const sub of submissions) {
      const normalizedEmail = sub.email.toLowerCase().trim();
      if (criteria.excludeUnsubscribed !== false && unsubscribedEmails.has(normalizedEmail)) {
        continue;
      }

      if (!seenEmails.has(normalizedEmail)) {
        seenEmails.add(normalizedEmail);
        eligible.push({
          registrationId: sub.id,
          email: sub.email.trim(),
          fullName: sub.fullName,
          referenceNumber: sub.referenceNumber,
          status: sub.status,
          category: "Mithila Queen Contestant",
          metadata: {
            source: "FORM_SUBMISSION",
            referenceNumber: sub.referenceNumber,
          },
        });
      }
    }
  }

  // 4. Query Manual Email Addresses if provided
  if (shouldIncludeManual && criteria.manualEmails && criteria.manualEmails.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const rawEmail of criteria.manualEmails) {
      const cleanEmail = rawEmail.trim();
      if (!cleanEmail || !emailRegex.test(cleanEmail)) continue;

      const normalizedEmail = cleanEmail.toLowerCase();

      // Check unsubscribe status
      if (criteria.excludeUnsubscribed !== false && unsubscribedEmails.has(normalizedEmail)) {
        continue;
      }

      // Prevent duplicate if already added by group targeting
      if (seenEmails.has(normalizedEmail)) {
        continue;
      }

      seenEmails.add(normalizedEmail);

      // Check if this manual email matches an existing participant in MithilaQueenRegistration
      const existingParticipant = await prisma.mithilaQueenRegistration.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
      });

      if (existingParticipant) {
        eligible.push({
          registrationId: null,
          email: cleanEmail,
          fullName: existingParticipant.fullName || "Mithila Queen Participant",
          referenceNumber: existingParticipant.registrationId,
          status: existingParticipant.applicationStatus,
          category: "Mithila Queen Contestant",
          metadata: {
            source: "MANUAL_MATCHED",
            referenceNumber: existingParticipant.registrationId,
            paymentStatus: existingParticipant.paymentStatus,
            applicationStatus: existingParticipant.applicationStatus,
          },
        });
      } else {
        // Pure manual email recipient (press, VIP, judge, partner)
        eligible.push({
          registrationId: null,
          email: cleanEmail,
          fullName: cleanEmail.split("@")[0],
          referenceNumber: "N/A",
          status: "MANUAL",
          category: "Invited Recipient",
          metadata: {
            source: "MANUAL_RECIPIENT",
            referenceNumber: "N/A",
          },
        });
      }
    }
  }

  return eligible;
}

/**
 * Creates an EmailCampaign and enqueues all eligible recipients in a single atomic transaction.
 */
export async function createAndEnqueueCampaign({
  name,
  formId,
  templateId,
  subject,
  content,
  criteria,
  scheduledAt,
  createdById,
}: {
  name: string;
  formId: string;
  templateId?: string;
  subject: string;
  content: string;
  criteria: RecipientCriteria;
  scheduledAt?: Date | null;
  createdById?: string;
}) {
  const eligibleRecipients = await resolveEligibleRecipients(formId, criteria);

  const initialStatus: CampaignStatus =
    scheduledAt && scheduledAt > new Date() ? CampaignStatus.SCHEDULED : CampaignStatus.QUEUED;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the campaign record
    const campaign = await tx.emailCampaign.create({
      data: {
        name,
        formId,
        templateId: templateId || null,
        subject,
        content,
        recipientCriteria: criteria as any,
        scheduledAt: scheduledAt || null,
        timezone: "Asia/Kathmandu",
        status: initialStatus,
        totalRecipients: eligibleRecipients.length,
        sentCount: 0,
        failedCount: 0,
        skippedCount: 0,
        createdById: createdById || null,
      },
    });

    // 2. Batch insert recipients if any
    if (eligibleRecipients.length > 0) {
      await tx.emailCampaignRecipient.createMany({
        data: eligibleRecipients.map((rec) => ({
          campaignId: campaign.id,
          registrationId: rec.registrationId || null,
          email: rec.email,
          fullName: rec.fullName,
          metadata: (rec.metadata as any) || null,
          status: RecipientDeliveryStatus.QUEUED,
          attemptCount: 0,
          maxAttempts: 3,
        })),
        skipDuplicates: true, // Idempotency protection against duplicate inserts
      });
    }

    // 3. Log initial creation
    await tx.emailDeliveryLog.create({
      data: {
        campaignId: campaign.id,
        email: "communications@theoriginfoundation.org",
        event: "CAMPAIGN_ENQUEUED",
        details: `Message "${name}" enqueued with ${eligibleRecipients.length} recipients. Status: ${initialStatus}`,
        metadata: {
          recipientCount: eligibleRecipients.length,
          scheduledAt: scheduledAt?.toISOString() || null,
        },
      },
    });

    return campaign;
  });
}

/**
 * Pauses an active or queued campaign.
 */
export async function pauseCampaign(campaignId: string) {
  return await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: CampaignStatus.PAUSED,
    },
  });
}

/**
 * Resumes a paused campaign.
 */
export async function resumeCampaign(campaignId: string) {
  return await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: CampaignStatus.QUEUED,
    },
  });
}

/**
 * Cancels a scheduled or running campaign.
 * Preserves already sent records while marking remaining queued recipients as CANCELLED.
 */
export async function cancelCampaign(campaignId: string) {
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    await tx.emailCampaignRecipient.updateMany({
      where: {
        campaignId,
        status: { in: [RecipientDeliveryStatus.QUEUED, RecipientDeliveryStatus.PENDING] },
      },
      data: {
        status: RecipientDeliveryStatus.CANCELLED,
      },
    });

    await tx.emailDeliveryLog.create({
      data: {
        campaignId,
        email: "system@formsuite.local",
        event: "CAMPAIGN_CANCELLED",
        details: "Campaign was manually cancelled by administrator.",
      },
    });

    return updated;
  });
}

/**
 * Retries failed recipients in a campaign.
 */
export async function retryFailedRecipients(campaignId: string) {
  return await prisma.$transaction(async (tx) => {
    // Reset failed recipients
    const result = await tx.emailCampaignRecipient.updateMany({
      where: {
        campaignId,
        status: RecipientDeliveryStatus.FAILED,
      },
      data: {
        status: RecipientDeliveryStatus.QUEUED,
        attemptCount: 0,
        nextRetryAt: null,
        lastError: null,
      },
    });

    // Recompute counts and set campaign back to QUEUED
    const [total, sent, failed, skipped] = await Promise.all([
      tx.emailCampaignRecipient.count({ where: { campaignId } }),
      tx.emailCampaignRecipient.count({
        where: { campaignId, status: { in: [RecipientDeliveryStatus.SENT, RecipientDeliveryStatus.DELIVERED] } },
      }),
      tx.emailCampaignRecipient.count({ where: { campaignId, status: RecipientDeliveryStatus.FAILED } }),
      tx.emailCampaignRecipient.count({ where: { campaignId, status: RecipientDeliveryStatus.SKIPPED } }),
    ]);

    await tx.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.QUEUED,
        totalRecipients: total,
        sentCount: sent,
        failedCount: failed,
        skippedCount: skipped,
        completedAt: null,
      },
    });

    return result.count;
  });
}

