import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { HardDrive, ArrowRight, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadSettingsCard } from "@/components/admin/upload-settings-card";
import { ChangePasswordCard } from "@/components/admin/change-password-card";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const driveIntegration = await prisma.googleDriveIntegration.findUnique({
    where: { id: "primary" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          System Settings & Storage
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Google Drive Integration Card */}
        <Card className="border-zinc-200 hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  driveIntegration?.isConnected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                {driveIntegration?.isConnected ? "Connected" : "Not Connected"}
              </span>
            </div>
            <CardTitle className="text-lg font-bold text-zinc-900">
              Google Drive Cloud Storage
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              OAuth 2.0 integration for storing participant video submissions directly into your Google Drive folder.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {driveIntegration?.isConnected ? (
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-1.5">
                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-xs">{driveIntegration.accountEmail}</span>
                </div>
                <div className="text-xs text-zinc-600 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                  <span className="text-zinc-500">Destination Folder:</span>
                  <span className="font-semibold text-zinc-900">
                    {driveIntegration.folderName || "Root Drive"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <span>
                  Google Drive is disconnected. Connect your Google account to automatically store participant registration videos.
                </span>
              </div>
            )}

            <Link href="/admin/settings/integrations/google-drive">
              <Button
                variant={driveIntegration?.isConnected ? "outline" : "default"}
                className={`w-full justify-between text-xs font-semibold h-10 ${
                  !driveIntegration?.isConnected
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-zinc-200"
                }`}
              >
                <span>
                  {driveIntegration?.isConnected
                    ? "Manage Drive & Change Folder"
                    : "Connect Google Drive Now"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upload Limits & Media Format Settings Card */}
        <UploadSettingsCard />
      </div>

      {/* Admin Account Security & Password Change */}
      <ChangePasswordCard />
    </div>
  );
}
