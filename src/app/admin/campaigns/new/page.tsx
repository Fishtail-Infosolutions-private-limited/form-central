import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultEmailTemplates } from "@/lib/email/templates/default-templates";
import { ComposeEmailView } from "@/components/campaigns/compose-email-view";

export const dynamic = "force-dynamic";

interface NewCampaignPageProps {
  searchParams?: Promise<{ duplicate?: string }> | { duplicate?: string };
}

export default async function NewCampaignPage(props: NewCampaignPageProps) {
  const admin = await requireAdmin();
  const resolvedSearchParams = await props.searchParams;
  const duplicateId = resolvedSearchParams?.duplicate || null;

  // Retrieve available templates, seeding defaults if database has none
  let templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      subject: true,
      bodyHtml: true,
    },
  });

  if (templates.length === 0) {
    try {
      await ensureDefaultEmailTemplates(prisma);
      templates = await prisma.emailTemplate.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          subject: true,
          bodyHtml: true,
        },
      });
    } catch (e) {
      console.error("Failed to seed default templates", e);
    }
  }

  return (
    <ComposeEmailView
      templates={templates}
      adminEmail={admin.email}
      duplicateId={duplicateId}
    />
  );
}
