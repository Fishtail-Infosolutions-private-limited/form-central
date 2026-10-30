import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { CampaignListView } from "@/components/campaigns/campaign-list-view";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  await requireAdmin();

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Calculate high-level metrics
  const totalCampaigns = campaigns.length;
  let totalSent = 0;
  let totalQueued = 0;
  let totalFailed = 0;

  for (const c of campaigns) {
    totalSent += c.sentCount;
    totalFailed += c.failedCount;
    if (["QUEUED", "PROCESSING", "SCHEDULED"].includes(c.status)) {
      totalQueued += Math.max(0, c.totalRecipients - (c.sentCount + c.failedCount + c.skippedCount));
    }
  }

  const serializedCampaigns = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    subject: c.subject,
    status: c.status,
    totalRecipients: c.totalRecipients,
    sentCount: c.sentCount,
    failedCount: c.failedCount,
    skippedCount: c.skippedCount,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    startedAt: c.startedAt ? c.startedAt.toISOString() : null,
    completedAt: c.completedAt ? c.completedAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    form: c.form,
  }));

  return (
    <CampaignListView
      campaigns={serializedCampaigns}
      stats={{
        totalCampaigns,
        totalSent,
        totalQueued,
        totalFailed,
      }}
    />
  );
}

