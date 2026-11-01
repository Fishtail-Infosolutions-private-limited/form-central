"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Video, Image as ImageIcon, FileText, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        toast.success("Upload limits saved successfully.");
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
    <Card className="border-cream-dark shadow-xs bg-warm-ivory">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-serif font-bold text-maroon">
            Upload Limits & Media Policy
          </CardTitle>
          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron bg-soft-cream px-2 py-0.5 rounded border border-[#B89150]/30">
            Storage
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Participant Video */}
        <div className="p-3.5 rounded-lg border border-cream-dark bg-soft-cream/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-saffron" />
              <Label className="text-xs font-bold text-maroon">
                Audition Video Limit (MP4, MOV, WebM)
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-maroon bg-white px-2 py-0.5 rounded border border-cream-dark">
              {videoLimit} MB
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[50, 100, 250, 500].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setVideoLimit(size)}
                className={`text-xs px-3 py-1 rounded-md font-semibold transition-all border ${
                  videoLimit === size
                    ? "bg-maroon text-white border-maroon"
                    : "bg-white text-stone-700 border-cream-dark hover:bg-soft-cream"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Participant Images */}
        <div className="p-3.5 rounded-lg border border-cream-dark bg-soft-cream/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-saffron" />
              <Label className="text-xs font-bold text-maroon">
                Photograph Size Limit (JPEG, PNG, WebP)
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-maroon bg-white px-2 py-0.5 rounded border border-cream-dark">
              {imageLimit} MB
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[5, 10, 15, 25].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setImageLimit(size)}
                className={`text-xs px-3 py-1 rounded-md font-semibold transition-all border ${
                  imageLimit === size
                    ? "bg-maroon text-white border-maroon"
                    : "bg-white text-stone-700 border-cream-dark hover:bg-soft-cream"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Identity & Consent Proof */}
        <div className="p-3.5 rounded-lg border border-cream-dark bg-soft-cream/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-saffron" />
              <Label className="text-xs font-bold text-maroon">
                Document / Minor Consent Limit (PDF, DOC, DOCX)
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-maroon bg-white px-2 py-0.5 rounded border border-cream-dark">
              {docLimit} MB
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[10, 25, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDocLimit(size)}
                className={`text-xs px-3 py-1 rounded-md font-semibold transition-all border ${
                  docLimit === size
                    ? "bg-maroon text-white border-maroon"
                    : "bg-white text-stone-700 border-cream-dark hover:bg-soft-cream"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold text-xs h-10 rounded-lg shadow-sm gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Limits...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Upload Limits</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
