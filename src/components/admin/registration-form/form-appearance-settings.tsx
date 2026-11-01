"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Upload,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FormAppearanceConfig } from "@/types/form";

interface FormAppearanceSettingsProps {
  appearance: FormAppearanceConfig;
  onChange: (updated: FormAppearanceConfig) => void;
}

export function FormAppearanceSettings({
  appearance,
  onChange,
}: FormAppearanceSettingsProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [isUploadingIntro, setIsUploadingIntro] = useState(false);

  const handleFieldChange = (field: keyof FormAppearanceConfig, value: string) => {
    onChange({
      ...appearance,
      [field]: value,
    });
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "headerImageUrl" | "introImageUrl",
    setLoading: (l: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image (PNG, JPG, WebP)");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldKey", field);

      const res = await fetch("/api/public/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        handleFieldChange(field, data.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#DCE5ED] bg-white shadow-xs">
      <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-[#263238] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dark-taupe" />
              <span>Form Appearance &amp; Introduction</span>
            </CardTitle>
            <CardDescription className="text-xs text-taupe-grey">
              Customize the public registration title, welcome message, introductory imagery, and submission text.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Core Headings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">Form Title (Browser / Tab)</Label>
            <Input
              value={appearance.formTitle || ""}
              onChange={(e) => handleFieldChange("formTitle", e.target.value)}
              placeholder="e.g. Mithila Queen 2026 Registration"
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">Main Page Heading</Label>
            <Input
              value={appearance.mainHeading || ""}
              onChange={(e) => handleFieldChange("mainHeading", e.target.value)}
              placeholder="e.g. Official Candidate Registration"
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>
        </div>

        {/* Descriptions & Welcome */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#263238]">Short Tagline / Description</Label>
          <Input
            value={appearance.shortDescription || ""}
            onChange={(e) => handleFieldChange("shortDescription", e.target.value)}
            placeholder="e.g. Celebrating Mithila's Culture, Confidence & Talent."
            className="h-9 text-xs border-[#DCE5ED] bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#263238]">Welcome Message</Label>
          <Textarea
            rows={2}
            value={appearance.welcomeMessage || ""}
            onChange={(e) => handleFieldChange("welcomeMessage", e.target.value)}
            placeholder="Welcome text shown prominently before the candidate starts filling the form..."
            className="text-xs border-[#DCE5ED] bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#263238]">
            Instructions Displayed Before Registration
          </Label>
          <Textarea
            rows={2}
            value={appearance.instructionsBefore || ""}
            onChange={(e) => handleFieldChange("instructionsBefore", e.target.value)}
            placeholder="e.g. Please ensure you have your legal identity details, high-resolution portrait photo, and audition video link ready before proceeding."
            className="text-xs border-[#DCE5ED] bg-white"
          />
        </div>

        {/* Visual Brand Assets: Logo & Header Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#DCE5ED]/50">
          {/* Logo / Header Image */}
          <div className="space-y-2 p-3.5 rounded-xl border border-[#DCE5ED] bg-[#F4F7FA]">
            <Label className="text-xs font-semibold text-[#263238] flex items-center justify-between">
              <span>Brand Logo / Emblem</span>
              {appearance.logoUrl && (
                <span className="text-[10px] text-emerald-700 font-bold">Uploaded</span>
              )}
            </Label>
            <div className="flex items-center gap-3">
              {appearance.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appearance.logoUrl}
                  alt="Logo preview"
                  className="w-12 h-12 object-contain rounded-md bg-white border border-warm-stone p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-white border border-warm-stone flex items-center justify-center text-taupe-grey">
                  <ImageIcon className="w-5 h-5 opacity-40" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadImage(e, "logoUrl", setIsUploadingLogo)}
                    className="hidden"
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#DCE5ED] text-xs font-semibold text-[#263238] hover:bg-cream-dark/30 shadow-2xs">
                    {isUploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                  </div>
                </label>
                {appearance.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange("logoUrl", "")}
                    className="block text-[10px] text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Introductory Banner Image */}
          <div className="space-y-2 p-3.5 rounded-xl border border-[#DCE5ED] bg-[#F4F7FA]">
            <Label className="text-xs font-semibold text-[#263238] flex items-center justify-between">
              <span>Introductory Banner Image</span>
              {appearance.introImageUrl && (
                <span className="text-[10px] text-emerald-700 font-bold">Uploaded</span>
              )}
            </Label>
            <div className="flex items-center gap-3">
              {appearance.introImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appearance.introImageUrl}
                  alt="Banner preview"
                  className="w-16 h-12 object-cover rounded-md bg-white border border-warm-stone"
                />
              ) : (
                <div className="w-16 h-12 rounded-md bg-white border border-warm-stone flex items-center justify-center text-taupe-grey">
                  <ImageIcon className="w-5 h-5 opacity-40" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadImage(e, "introImageUrl", setIsUploadingIntro)}
                    className="hidden"
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#DCE5ED] text-xs font-semibold text-[#263238] hover:bg-cream-dark/30 shadow-2xs">
                    {isUploadingIntro ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingIntro ? "Uploading..." : "Upload Banner"}</span>
                  </div>
                </label>
                {appearance.introImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange("introImageUrl", "")}
                    className="block text-[10px] text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1 Pre-text, Button Text & Success Message */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#DCE5ED]/50">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">
              Notice Before First Step (Identity)
            </Label>
            <Input
              value={appearance.textBeforeFirstStep || ""}
              onChange={(e) => handleFieldChange("textBeforeFirstStep", e.target.value)}
              placeholder="e.g. Identity verification code will be sent to your email."
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">Final Submit Button Text</Label>
            <Input
              value={appearance.submitButtonText || ""}
              onChange={(e) => handleFieldChange("submitButtonText", e.target.value)}
              placeholder="e.g. Complete Registration & Proceed to Review"
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-[#263238]">
              Success Message After Submission
            </Label>
            <Input
              value={appearance.successMessage || ""}
              onChange={(e) => handleFieldChange("successMessage", e.target.value)}
              placeholder="e.g. Thank you! Your application has been recorded. Complete the payment step below to finalize."
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-[#263238]">Form Footer Information</Label>
            <Input
              value={appearance.footerInformation || ""}
              onChange={(e) => handleFieldChange("footerInformation", e.target.value)}
              placeholder="e.g. The Origin Foundation • Janakpur Dham, Nepal • Helpline: +977 9704571941"
              className="h-9 text-xs border-[#DCE5ED] bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


