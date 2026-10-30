import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { CompetitionWorkspace } from "@/components/admin/competition-workspace";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Manage Competition | Origin Foundation Admin",
};

export default async function AdminManageCompetitionPage() {
  await requireAdmin();

  // Find or ensure the dedicated Mithila Queen form
  let form = await prisma.registrationForm.findFirst({
    where: { slug: "mithila-queen" },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) {
    form = await prisma.registrationForm.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });
  }

  if (!form) {
    notFound();
  }

  // Fetch Site Settings
  const siteSetting = await prisma.siteSetting.findUnique({ where: { id: "primary" } });

  return (
    <CompetitionWorkspace
      form={form as any}
      siteSetting={siteSetting}
    />
  );
}
