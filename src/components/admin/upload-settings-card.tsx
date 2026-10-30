"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Video, Image as ImageIcon, FileText, CheckCircle2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function UploadSettingsCard() {
  const [videoLimit, setVideoLimit] = useState("100");
  const [imageLimit, setImageLimit] = useState("10");
  const [docLimit, setDocLimit] = useState("25");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load persisted preferences if saved
    const saved = localStorage.getItem("fc_upload_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.videoLimit) setVideoLimit(parsed.videoLimit);
        if (parsed.imageLimit) setImageLimit(parsed.imageLimit);
        if (parsed.docLimit) setDocLimit(parsed.docLimit);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        "fc_upload_settings",
        JSON.stringify({ videoLimit, imageLimit, docLimit })
      );
      setIsSaving(false);
      toast.success("Upload limits & media formats saved successfully");
    }, 400);
  };

  return (
    <Card className="border-zinc-200 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            System Config
          </span>
        </div>
        <CardTitle className="text-lg font-bold text-zinc-900">
          Upload Limits & Media Configuration
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Configure maximum file sizes and allowed formats for participant submissions across all forms.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        {/* Video Limit */}
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-700" />
              <Label className="text-xs font-bold text-zinc-900">
                Max Participant Video Size
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {videoLimit} MB
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Uploaded videos stream directly to your connected Google Drive folder.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {["50", "100", "250", "500"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setVideoLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  videoLimit === size
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Image Limit & Formats */}
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <Label className="text-xs font-bold text-zinc-900">
                Max Image Size & Formats
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {imageLimit} MB
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Accepted formats:</span>
            <span className="font-mono text-zinc-800 font-semibold">JPG, PNG, WebP, GIF, SVG, BMP</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {["5", "10", "15", "25"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setImageLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  imageLimit === size
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Document Limit & Formats */}
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <Label className="text-xs font-bold text-zinc-900">
                Max Document Size & Formats
              </Label>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {docLimit} MB
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Accepted formats:</span>
            <span className="font-mono text-zinc-800 font-semibold">PDF, DOC, DOCX</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {["10", "25", "50"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDocLimit(size)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all border ${
                  docLimit === size
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving Limits..." : "Save Upload Configuration"}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
