import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { CampaignCreatorForm } from "@/components/campaigns/campaign-creator-form";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const admin = await requireAdmin();

  const [forms, templates, previousCampaigns] = await Promise.all([
    prisma.registrationForm.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        eventDate: true,
        eventVenue: true,
        versions: {
          take: 1,
          orderBy: { versionNumber: "desc" },
          select: { schema: true },
        },
      },
    }),
    prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        subject: true,
        bodyHtml: true,
      },
    }),
    prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  // Extract category options from form schemas if available
  const formattedForms = forms.map((f) => {
    const categories: string[] = [];
    const schema = f.versions[0]?.schema as any;
    if (schema?.steps) {
      for (const step of schema.steps) {
        for (const field of step.fields || []) {
          if (
            field.fieldKey?.toLowerCase().includes("category") ||
            field.label?.toLowerCase().includes("category")
          ) {
            for (const opt of field.options || []) {
              if (opt.value && !categories.includes(opt.value)) {
                categories.push(opt.value);
              }
            }
          }
        }
      }
    }
    return {
      id: f.id,
      name: f.name,
      slug: f.slug,
      eventDate: f.eventDate ? f.eventDate.toISOString() : null,
      eventVenue: f.eventVenue,
      categories: categories.length > 0 ? categories : ["Open", "Fun Run", "5K", "10K", "21K", "42K"],
    };
  });

  return (
    <CampaignCreatorForm
      forms={formattedForms}
      templates={templates}
      previousCampaigns={previousCampaigns}
      adminEmail={admin.email}
    />
  );
}
