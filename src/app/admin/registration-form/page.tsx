import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { RegistrationFormWorkspace } from "@/components/admin/registration-form/registration-form-workspace";
import { DEFAULT_MITHILA_QUEEN_SCHEMA } from "@/lib/constants/default-form-schema";

export const metadata = {
  title: "Registration Form Workspace | The Origin Foundation Admin",
};

export default async function AdminRegistrationFormPage() {
  const admin = await requireAdmin();

  // Find or ensure the dedicated Mithila Queen form
  let form = await prisma.registrationForm.findFirst({
    where: { slug: "mithila-queen" },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!form) {
    form = await prisma.registrationForm.create({
      data: {
        name: "Mithila Queen 2026",
        slug: "mithila-queen",
        description:
          "Official flagship competition celebrating Mithila's culture, confidence & talent in Janakpur Dham, Nepal. Fee: NPR 399.",
        instructions:
          "Complete the structured online application. For applicants under 18, legal guardian consent is recorded. Keep your transaction reference ready.",
        status: "PUBLISHED",
        createdById: admin.id,
        isUnlimitedCapacity: true,
        isDeadlineEnabled: false,
      },
      include: {
        versions: true,
      },
    });

    const v1 = await prisma.formVersion.create({
      data: {
        formId: form.id,
        versionNumber: 1,
        schema: DEFAULT_MITHILA_QUEEN_SCHEMA as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.registrationForm.update({
      where: { id: form.id },
      data: { publishedVersionId: v1.id },
    });

    form = await prisma.registrationForm.findUnique({
      where: { id: form.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });
  }

  // Ensure form has at least one version with full schema and modern separated step structure
  const latestVersion = form?.versions?.[0];
  const schemaSteps = (latestVersion?.schema as any)?.steps;
  const hasSeparatedLocationStep = Array.isArray(schemaSteps) && schemaSteps.some((s: any) => s.id === "step-personal-location");

  if (!latestVersion || !Array.isArray(schemaSteps) || schemaSteps.length === 0 || !hasSeparatedLocationStep) {
    const nextVerNum = (latestVersion?.versionNumber || 0) + 1;
    const newVersion = await prisma.formVersion.create({
      data: {
        formId: form!.id,
        versionNumber: nextVerNum,
        schema: DEFAULT_MITHILA_QUEEN_SCHEMA as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.registrationForm.update({
      where: { id: form!.id },
      data: { publishedVersionId: newVersion.id },
    });

    form = await prisma.registrationForm.findUnique({
      where: { id: form!.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });
  }

  if (!form) {
    notFound();
  }

  // Fetch primary site settings
  let siteSetting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });

  if (!siteSetting) {
    siteSetting = await prisma.siteSetting.create({
      data: {
        id: "primary",
        organizationName: "The Origin Foundation",
        organizationTagline: "Rooted in Identity. Driven by Purpose.",
        competitionName: "Mithila Queen",
        competitionTagline: "Celebrating Mithila's Culture, Confidence & Talent.",
        location: "Janakpur Dham, Nepal",
        officialEmail: "originfoundation107@gmail.com",
        registrationFee: 399,
        eventSchedule: "To Be Announced",
        eventVenue: "To Be Announced",
        isRegistrationOpen: true,
        whatsappContact: "+977 9704571941",
      },
    });
  }

  return (
    <RegistrationFormWorkspace
      form={form as any}
      siteSetting={siteSetting}
    />
  );
}

