import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      recipients: {
        orderBy: { createdAt: "asc" },
        take: 300,
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          attemptCount: true,
          lastError: true,
          sentAt: true,
          deliveredAt: true,
          providerMessageId: true,
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          email: true,
          event: true,
          details: true,
          createdAt: true,
        },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const serializedCampaign = {
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    content: campaign.content,
    status: campaign.status,
    totalRecipients: campaign.totalRecipients,
    sentCount: campaign.sentCount,
    failedCount: campaign.failedCount,
    skippedCount: campaign.skippedCount,
    scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.toISOString() : null,
    startedAt: campaign.startedAt ? campaign.startedAt.toISOString() : null,
    completedAt: campaign.completedAt ? campaign.completedAt.toISOString() : null,
    createdAt: campaign.createdAt.toISOString(),
    form: campaign.form,
    recipients: campaign.recipients.map((r) => ({
      ...r,
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      deliveredAt: r.deliveredAt ? r.deliveredAt.toISOString() : null,
    })),
    logs: campaign.logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return <CampaignDetailView campaign={serializedCampaign} />;
}
