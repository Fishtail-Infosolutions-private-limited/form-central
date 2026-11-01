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
        <h1 className="text-2xl font-bold font-bold text-[#183153] tracking-tight flex items-center gap-2.5">
          <HardDrive className="w-7 h-7 text-[#356FA8]" />
          <span>Google Drive Storage Integration</span>
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Connect the official organization Google account and configure the destination folder for participant audition videos.
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


