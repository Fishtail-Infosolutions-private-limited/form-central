import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { UnifiedSettingsCMS } from "@/components/admin/unified-settings-cms";

export const metadata = {
  title: "Website & Competition Settings | Origin Foundation Admin",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [setting, driveIntegration] = await Promise.all([
    prisma.siteSetting.findUnique({
      where: { id: "primary" },
    }),
    prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <UnifiedSettingsCMS
        initialSettings={setting}
        driveIntegration={driveIntegration}
      />
    </div>
  );
}
