"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Video, Image as ImageIcon, FileText, CheckCircle2, Save, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getUploadLimitsAction, updateUploadLimitsAction } from "@/server/actions/site-settings-actions";

export function UploadSettingsCard() {
  const [videoLimit, setVideoLimit] = useState(100);
  const [imageLimit, setImageLimit] = useState(10);
  const [docLimit, setDocLimit] = useState(25);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUploadLimitsAction().then((res) => {
      if (res.success && res.limits) {
        if (res.limits.maxVideoMb) setVideoLimit(Number(res.limits.maxVideoMb));
        if (res.limits.maxImageMb) setImageLimit(Number(res.limits.maxImageMb));
        if (res.limits.maxDocMb) setDocLimit(Number(res.limits.maxDocMb));
      }
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateUploadLimitsAction({
        maxVideoMb: videoLimit,
        maxImageMb: imageLimit,
        maxDocMb: docLimit,
      });

      if (res.success) {
        toast.success("Upload limits & media storage rules saved successfully!");
      } else {
        toast.error(res.error || "Failed to update upload configuration");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-[#E2E8F0] shadow-xs bg-[#FFFFFF]">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <div className="w-9 h-9 rounded-md bg-[#F8FAFC] text-[#C5A880] flex items-center justify-center border border-[#C5A880]/30">
            <UploadCloud className="w-4 h-4 text-[#A64B36]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#C5A880]/30">
            System Config
          </span>
        </div>
        <CardTitle className="text-base font-serif font-bold text-[#0A192F]">
          Upload Limits & Media Storage Policy
        </CardTitle>
        <CardDescription className="text-xs text-[#0A192F]/70">
          Configure maximum file sizes and storage destinations for participant audition videos, portrait photographs, and identification proofs.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Participant Video */}
        <div className="p-3.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#A64B36]" />
              <Label className="text-xs font-bold text-[#0A192F]">
                Max Participant Audition Video Size
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-[#0A192F] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {videoLimit} MB
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Accepted formats: <strong>MP4, MOV, WebM</strong>. Audition videos stream directly to your organization&apos;s connected Google Drive folder to prevent server disk exhaustion.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {[50, 100, 250, 500].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setVideoLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  videoLimit === size
                    ? "bg-[#0A192F] text-[#F1F5F9] border-[#0A192F]"
                    : "bg-white text-[#0A192F] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Participant Images */}
        <div className="p-3.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C5A880]" />
              <Label className="text-xs font-bold text-[#0A192F]">
                Max Candidate Photograph Size
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-[#0A192F] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {imageLimit} MB
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Accepted formats: <strong>JPEG, PNG, WebP</strong>. Participant portrait photos and payment receipts are stored locally with strict caching and anti-crawling headers.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {[5, 10, 15, 25].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setImageLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  imageLimit === size
                    ? "bg-[#0A192F] text-[#F1F5F9] border-[#0A192F]"
                    : "bg-white text-[#0A192F] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Identity & Legal Documents */}
        <div className="p-3.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A192F]" />
              <Label className="text-xs font-bold text-[#0A192F]">
                Max Identity / Consent Proof Size
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-[#0A192F] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {docLimit} MB
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Accepted formats: <strong>PDF, DOC, DOCX</strong>. Identity verification proofs and minor safeguarding documents are stored privately with zero search engine indexing.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {[10, 25, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDocLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  docLimit === size
                    ? "bg-[#0A192F] text-[#F1F5F9] border-[#0A192F]"
                    : "bg-white text-[#0A192F] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs font-semibold h-9 px-4 gap-2 border border-[#C5A880]/40 shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                <span>Saving Upload Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Save Upload Configuration</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
