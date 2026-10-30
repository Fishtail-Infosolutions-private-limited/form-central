import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadSettingsCard } from "@/components/admin/upload-settings-card";
import { ChangePasswordCard } from "@/components/admin/change-password-card";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";

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
      {/* Editorial Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-[#C5A880]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#C5A880]">
              Administrative Settings &bull; The Origin Foundation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A192F] tracking-tight">
            Platform Infrastructure & Security
          </h1>
          <p className="text-xs sm:text-sm text-[#0A192F]/70">
            Dedicated system settings: Google Drive storage, media upload limits, and administrator credentials.
          </p>
        </div>

        <Link href="/admin/forms">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 border-[#E2E8F0] text-[#0A192F] hover:bg-[#F8FAFC] font-semibold gap-1.5 shadow-xs"
          >
            <span>Manage Competition</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A64B36]" />
          </Button>
        </Link>
      </div>

      {/* 6.1 Google Drive Storage Integration */}
      <Card className="border-[#E2E8F0] bg-[#FFFFFF] shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <div className="w-9 h-9 rounded-md bg-[#F8FAFC] text-[#0A192F] border border-[#C5A880]/40 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-[#A64B36]" />
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                driveIntegration?.isConnected
                  ? "bg-[#0A192F] text-[#F1F5F9] border-[#C5A880]/40"
                  : "bg-[#F8FAFC] text-[#A64B36] border-[#A64B36]/30"
              }`}
            >
              {driveIntegration?.isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <CardTitle className="text-base font-serif font-bold text-[#0A192F]">
            Google Drive Storage Integration
          </CardTitle>
          <CardDescription className="text-xs text-[#0A192F]/70">
            Direct OAuth 2.0 connection to stream large audition video uploads into your official organization cloud folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {driveIntegration?.isConnected ? (
            <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0A192F] space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#0A192F] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span className="font-mono text-xs">{driveIntegration.accountEmail}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Active OAuth 2.0
                </span>
              </div>
              <div className="text-xs text-[#0A192F]/70 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                <span>Destination Folder:</span>
                <span className="font-semibold text-[#0A192F]">
                  {driveIntegration.folderName || "Root Drive"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#C5A880]/40 text-xs text-[#0A192F] flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#A64B36] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#0A192F]">
                  Google Drive is disconnected. Connect the official organization account to receive participant video files without exhausting server disk storage.
                </p>
                <p className="text-[11px] text-[#0A192F]/70">
                  When connected, video files uploaded in Step 4 are automatically streamed into Google Drive.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link href="/admin/settings/integrations/google-drive">
              <Button
                variant="outline"
                className="text-xs font-semibold h-9 px-4 border-[#E2E8F0] text-[#0A192F] hover:bg-[#F8FAFC] gap-1.5"
              >
                <span>
                  {driveIntegration?.isConnected
                    ? "Manage Drive & Change Folder"
                    : "Connect Google Drive Account"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A64B36]" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 6.2 Upload Configuration & 6.3 Account Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Limits & Media Configuration */}
        <UploadSettingsCard />

        {/* Change Admin Password */}
        <ChangePasswordCard />
      </div>
    </div>
  );
}
