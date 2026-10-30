import { prisma } from "@/lib/db/prisma";
import { CampaignStatus, RecipientDeliveryStatus } from "@prisma/client";

export interface RecipientCriteria {
  type: "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CATEGORY" | "MANUAL" | "EXCLUDE_CAMPAIGN";
  categoryValue?: string;
  categoryFieldKey?: string;
  manualIds?: string[];
  excludeCampaignId?: string;
  excludeUnsubscribed?: boolean;
}

export interface EligibleRecipient {
  registrationId: string;
  email: string;
  fullName: string;
  referenceNumber: string;
  status: string;
  category?: string;
}

/**
 * Resolves eligible recipients for a campaign based on form and criteria.
 * Guarantees that only verified, submitted registrations are included,
 * and excludes unsubscribed participants where applicable.
 */
export async function resolveEligibleRecipients(
  formId: string,
  criteria: RecipientCriteria
): Promise<EligibleRecipient[]> {
  // 1. Base query for submitted registrations in this form
  const whereClause: any = {
    formId,
  };

  if (criteria.type === "APPROVED") {
    whereClause.status = "APPROVED";
  } else if (criteria.type === "PENDING") {
    whereClause.status = "PENDING";
  } else if (criteria.type === "REJECTED") {
    whereClause.status = "REJECTED";
  } else if (criteria.type === "MANUAL" && criteria.manualIds && criteria.manualIds.length > 0) {
    whereClause.id = { in: criteria.manualIds };
  }

  // Fetch submissions with answers (needed for category matching)
  const submissions = await prisma.registrationSubmission.findMany({
    where: whereClause,
    include: {
      answers: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  // 2. Fetch unsubscribed emails for this form (or globally)
  const unsubscribes = await prisma.emailUnsubscribe.findMany({
    where: {
      OR: [{ formId }, { formId: null }],
    },
    select: { email: true },
  });
  const unsubscribedEmails = new Set(unsubscribes.map((u) => u.email.toLowerCase().trim()));

  // 3. If excluding recipients of another campaign
  let excludedRegistrationIds = new Set<string>();
  if (criteria.type === "EXCLUDE_CAMPAIGN" && criteria.excludeCampaignId) {
    const existingRecipients = await prisma.emailCampaignRecipient.findMany({
      where: {
        campaignId: criteria.excludeCampaignId,
        status: { in: [RecipientDeliveryStatus.SENT, RecipientDeliveryStatus.DELIVERED] },
      },
      select: { registrationId: true },
    });
    excludedRegistrationIds = new Set(existingRecipients.map((r) => r.registrationId));
  }

  // 4. Filter and build recipient list
  const eligible: EligibleRecipient[] = [];
  const seenEmails = new Set<string>();

  for (const sub of submissions) {
    const normalizedEmail = sub.email.toLowerCase().trim();

    // Check unsubscribe status
    if (criteria.excludeUnsubscribed !== false && unsubscribedEmails.has(normalizedEmail)) {
      continue;
    }

    // Check campaign exclusion
    if (excludedRegistrationIds.has(sub.id)) {
      continue;
    }

    // Find category from answers
    let participantCategory = "General";
    for (const ans of sub.answers) {
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

    // Category filter
    if (criteria.type === "CATEGORY" && criteria.categoryValue) {
      const match = sub.answers.some((ans) => {
        const valStr = typeof ans.value === "string" ? ans.value : JSON.stringify(ans.value || "");
        return valStr.toLowerCase().includes(criteria.categoryValue!.toLowerCase());
      });
      if (!match) continue;
    }

    // Deduplicate by registration / email for this campaign run
    if (!seenEmails.has(normalizedEmail)) {
      seenEmails.add(normalizedEmail);
      eligible.push({
        registrationId: sub.id,
        email: sub.email,
        fullName: sub.fullName,
        referenceNumber: sub.referenceNumber,
        status: sub.status,
        category: participantCategory,
      });
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
          registrationId: rec.registrationId,
          email: rec.email,
          fullName: rec.fullName,
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
        email: "system@formsuite.local",
        event: "CAMPAIGN_ENQUEUED",
        details: `Campaign "${name}" enqueued with ${eligibleRecipients.length} recipients. Status: ${initialStatus}`,
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

