/**
 * Standalone Background Worker for FormSuite Email Campaigns
 * Run using: npm run worker:emails (or npx tsx scripts/email-worker.ts)
 *
 * Continuously polls and processes campaign batches without relying on HTTP requests.
 * Ideal for containerized deployments, systemd services, or background worker dynos.
 */

import { processNextCampaignBatch } from "../src/lib/email/worker";
import { prisma } from "../src/lib/db/prisma";

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || 5000);
const WORKER_ID = `cli-worker-${process.pid}-${Math.random().toString(36).substring(2, 6)}`;

let isShuttingDown = false;

async function runWorker() {
  console.log(`🚀 [FormSuite Worker] Started Email Campaign Worker (${WORKER_ID})`);
  console.log(`⏱️ Polling interval: ${POLL_INTERVAL_MS}ms`);

  while (!isShuttingDown) {
    try {
      const result = await processNextCampaignBatch(WORKER_ID);

      if (result.processedCount > 0) {
        console.log(
          `📧 [${new Date().toLocaleTimeString()}] Processed batch of ${result.processedCount} recipient(s) for Campaign ${result.campaignId}`
        );
        // If there's more work, immediately process next batch without waiting
        if (result.hasMore) {
          continue;
        }
      }
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Worker error:`, error);
    }

    // Sleep before next polling cycle
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.log(`🛑 [FormSuite Worker] Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Requesting graceful worker stop...");
  isShuttingDown = true;
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Requesting graceful worker stop...");
  isShuttingDown = true;
});

runWorker();
