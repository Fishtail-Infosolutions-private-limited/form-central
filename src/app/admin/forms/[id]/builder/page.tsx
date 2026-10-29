import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { BuilderWorkspace } from "@/components/admin/form-builder/builder-workspace";
import { FormSchemaDefinition } from "@/types/form";

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const form = await prisma.registrationForm.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) {
    notFound();
  }

  const latestVersion = form.versions[0];
  const initialSchema = (latestVersion?.schema as unknown as FormSchemaDefinition) || {
    steps: [
      {
        id: "step-1",
        title: "Personal Information",
        order: 0,
        fields: [
          {
            id: "system-fullname",
            fieldKey: "fullName",
            type: "text",
            label: "Full Name",
            required: true,
            isSystem: true,
            order: 0,
          },
          {
            id: "system-email",
            fieldKey: "email",
            type: "email",
            label: "Email Address",
            required: true,
            isSystem: true,
            order: 1,
          },
          {
            id: "system-phone",
            fieldKey: "phone",
            type: "phone",
            label: "Phone Number",
            required: true,
            isSystem: true,
            order: 2,
          },
        ],
      },
    ],
  };

  return (
    <BuilderWorkspace
      form={{
        id: form.id,
        name: form.name,
        slug: form.slug,
        description: form.description,
        status: form.status,
      }}
      initialSchema={initialSchema}
      publishedVersionNumber={latestVersion?.versionNumber}
    />
  );
}

