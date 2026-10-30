import { NextRequest, NextResponse } from "next/server";
import { processNextCampaignBatch } from "@/lib/email/worker";
import { prisma } from "@/lib/db/prisma";
import { syncEventRemindersForForm } from "@/lib/email/reminders";

export const dynamic = "force-dynamic";

/**
 * Background worker cron endpoint.
 * Suitable for Vercel Cron (configured in vercel.json) or external cron services (cron-job.org, Upstash, etc.)
 *
 * Security: Checks for Authorization: Bearer <CRON_SECRET> or ?secret=<CRON_SECRET> if CRON_SECRET is configured.
 */
export async function GET(request: NextRequest) {
  return handleWorkerRun(request);
}

export async function POST(request: NextRequest) {
  return handleWorkerRun(request);
}

async function handleWorkerRun(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      querySecret === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Sync reminders for active forms
    const activeForms = await prisma.registrationForm.findMany({
      where: {
        status: "PUBLISHED",
        eventDate: { not: null },
      },
      select: { id: true },
    });

    for (const form of activeForms) {
      await syncEventRemindersForForm(form.id);
    }

    // 2. Process up to 5 batches of emails in this invocation
    let batchesProcessed = 0;
    let totalEmailsSent = 0;
    let hasMore = true;

    while (hasMore && batchesProcessed < 5) {
      const result = await processNextCampaignBatch("cron-worker");
      batchesProcessed++;
      totalEmailsSent += result.processedCount;
      hasMore = result.hasMore && result.processedCount > 0;
    }

    return NextResponse.json({
      success: true,
      batchesProcessed,
      totalEmailsProcessed: totalEmailsSent,
      hasMore,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CronWorker] Error processing email batch:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process campaign batch" },
      { status: 500 }
    );
  }
}

