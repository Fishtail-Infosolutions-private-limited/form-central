import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { RecipientDeliveryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * Universal email delivery webhook handler.
 * Supports standard webhook payloads from major email providers
 * (SendGrid, Mailgun, AWS SES, Postmark, Resend).
 */
export async function POST(request: NextRequest) {
  try {
    // Optional webhook signature verification
    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature =
        request.headers.get("x-webhook-signature") ||
        request.headers.get("x-signature") ||
        request.nextUrl.searchParams.get("secret");

      if (signature !== webhookSecret) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = await request.json();

    // Standardize event list: some providers send an array, others an object
    const events: any[] = Array.isArray(body) ? body : [body];

    let updatedCount = 0;

    for (const evt of events) {
      // Find message ID and email
      const messageId =
        evt.messageId ||
        evt["message-id"] ||
        evt.sg_message_id ||
        evt.providerMessageId;

      const email = evt.email || evt.recipient;
      const eventType = String(evt.event || evt.type || "").toLowerCase();

      if (!messageId && !email) continue;

      // Locate the recipient record in DB
      const recipient = await prisma.emailCampaignRecipient.findFirst({
        where: {
          OR: [
            ...(messageId ? [{ providerMessageId: messageId }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (!recipient) continue;

      let newStatus: RecipientDeliveryStatus | null = null;
      let logEvent = "PROVIDER_UPDATE";
      let details = `Provider status updated: ${eventType}`;

      if (eventType.includes("deliver")) {
        newStatus = RecipientDeliveryStatus.DELIVERED;
        logEvent = "DELIVERED";
        details = "Confirmed delivered to participant inbox by provider webhook.";
      } else if (eventType.includes("bounce") || eventType.includes("hard_bounce")) {
        newStatus = RecipientDeliveryStatus.BOUNCED;
        logEvent = "BOUNCED";
        details = `Email bounced: ${evt.reason || evt.diagnosticCode || "Mailbox rejected"}`;
      } else if (eventType.includes("fail") || eventType.includes("dropped")) {
        newStatus = RecipientDeliveryStatus.FAILED;
        logEvent = "FAILED";
        details = `Delivery failed: ${evt.reason || "Provider dropped message"}`;
      }

      if (newStatus) {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: newStatus,
            deliveredAt: newStatus === RecipientDeliveryStatus.DELIVERED ? new Date() : recipient.deliveredAt,
            lastError: newStatus === RecipientDeliveryStatus.BOUNCED ? details : recipient.lastError,
          },
        });

        await prisma.emailDeliveryLog.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipient.id,
            registrationId: recipient.registrationId,
            email: recipient.email,
            event: logEvent,
            details,
            metadata: evt,
          },
        });

        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, processedEvents: updatedCount });
  } catch (err: any) {
    console.error("[EmailWebhook] Processing error:", err);
    return NextResponse.json({ error: err.message || "Failed to process webhook" }, { status: 500 });
  }
}

