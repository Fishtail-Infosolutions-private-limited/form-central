import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { ArrowLeft, HardDrive, Shield } from "lucide-react";
import { GoogleDriveManager } from "@/components/admin/google-drive-manager";

export default async function GoogleDriveIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await requireAdmin();
  const query = await searchParams;

  const integration = await prisma.googleDriveIntegration.findUnique({
    where: { id: "primary" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <HardDrive className="w-8 h-8 text-emerald-600" />
          <span>Google Drive Integration</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Connect your Google account and configure the destination folder for participant video submissions.
        </p>
      </div>

      <GoogleDriveManager
        integration={integration}
        initialError={query.error}
        initialSuccess={query.connected === "true"}
      />
    </div>
  );
}

