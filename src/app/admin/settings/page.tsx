import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadSettingsCard } from "@/components/admin/upload-settings-card";
import { ChangePasswordCard } from "@/components/admin/change-password-card";

export const metadata = {
  title: "Settings | Origin Foundation Admin",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const driveIntegration = await prisma.googleDriveIntegration.findUnique({
    where: { id: "primary" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Clean Header */}
      <div className="bg-warm-ivory p-5 rounded-xl border border-cream-dark shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-maroon tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Google Drive storage, upload limits, and administrator credentials.
          </p>
        </div>

        <Link href="/admin/forms">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 border-cream-dark text-maroon hover:bg-soft-cream font-semibold gap-1.5 shadow-xs"
          >
            <span>Manage Competition</span>
            <ArrowRight className="w-3.5 h-3.5 text-saffron" />
          </Button>
        </Link>
      </div>

      {/* Google Drive Storage Integration */}
      <Card className="border-cream-dark bg-warm-ivory shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-saffron" />
              <CardTitle className="text-base font-serif font-bold text-maroon">
                Google Drive Storage
              </CardTitle>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                driveIntegration?.isConnected
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {driveIntegration?.isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {driveIntegration?.isConnected ? (
            <div className="p-3.5 rounded-lg bg-soft-cream border border-cream-dark text-xs text-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-maroon flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-xs">{driveIntegration.accountEmail}</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  Active
                </span>
              </div>
              <div className="text-xs text-stone-600 flex items-center justify-between pt-1.5 border-t border-cream-dark">
                <span>Destination Folder:</span>
                <span className="font-semibold text-stone-900">
                  {driveIntegration.folderName || "Root Drive"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="font-medium">
                Google Drive is not connected. Connect your Google account in Settings to receive registration video uploads directly into Drive.
              </p>
            </div>
          )}

          <div>
            <Link href="/admin/settings/integrations/google-drive">
              <Button
                variant="outline"
                className="text-xs font-semibold h-9 px-4 border-cream-dark text-maroon hover:bg-soft-cream gap-1.5"
              >
                <span>
                  {driveIntegration?.isConnected
                    ? "Manage Drive Folder"
                    : "Connect Google Drive"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-saffron" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upload Configuration & Account Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <UploadSettingsCard />
        <ChangePasswordCard />
      </div>
    </div>
  );
}
