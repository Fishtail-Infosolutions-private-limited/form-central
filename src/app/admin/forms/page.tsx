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

  // Fetch Site Settings & Dossier statistics
  const [siteSetting, totalRegs, completedRegs, verifiedPayments, appsUnderReview, approvedApps] =
    await Promise.all([
      prisma.siteSetting.findUnique({ where: { id: "primary" } }),
      prisma.mithilaQueenRegistration.count(),
      prisma.mithilaQueenRegistration.count({ where: { isCompleted: true } }),
      prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "VERIFIED" } }),
      prisma.mithilaQueenRegistration.count({
        where: { applicationStatus: { in: ["UNDER_REVIEW", "SUBMITTED"] } },
      }),
      prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    ]);

  return (
    <CompetitionWorkspace
      form={form as any}
      siteSetting={siteSetting}
      stats={{
        totalRegs,
        completedRegs,
        verifiedPayments,
        appsUnderReview,
        approvedApps,
      }}
    />
  );
}
