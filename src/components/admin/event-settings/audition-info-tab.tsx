"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Video,
  Clock,
  Hash,
  Send,
  Phone,
  FileCheck2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface AuditionInfoTabProps {
  data: {
    videoGuidelines: string;
    videoDuration: string;
    videoRequirements: string;
    whatsappContact: string;
    requiredHashtags: string;
    videoSubmissionDeadline: string; // YYYY-MM-DD
    videoSubmissionMethod: string;
    applicantInstructions: string;
  };
  onChange: (updates: Partial<AuditionInfoTabProps["data"]>) => void;
}

export function AuditionInfoTab({ data, onChange }: AuditionInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Video Guidelines Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Video className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Audition Video Submission Guidelines
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Instructions for candidates submitting introduction and talent showcase videos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Audition Guidelines (Rich Text)
            </Label>
            <div className="border border-[var(--color-brand-border,#DCD8D1)] rounded-md overflow-hidden bg-white">
              <RichTextEditor
                name="videoGuidelines"
                value={data.videoGuidelines}
                onChange={(val) => onChange({ videoGuidelines: val })}
                placeholder="Explain the video format, speech content, cultural element, dress code, and what the jury looks for..."
                minHeight="180px"
              />
            </div>
            <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
              Displayed prominently on the public Auditions & Video Submission guides.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Recommended Video Duration</span>
              </Label>
              <Input
                value={data.videoDuration}
                onChange={(e) => onChange({ videoDuration: e.target.value })}
                placeholder="e.g. 60 - 90 seconds (Max 2 minutes)"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Video Submission Deadline</span>
              </Label>
              <Input
                type="date"
                value={data.videoSubmissionDeadline}
                onChange={(e) => onChange({ videoSubmissionDeadline: e.target.value })}
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Technical & Recording Requirements
            </Label>
            <Textarea
              value={data.videoRequirements}
              onChange={(e) => onChange({ videoRequirements: e.target.value })}
              placeholder="e.g. Vertical or landscape orientation, clear lighting, audible voice without background noise, no heavy AI face filters."
              rows={3}
              className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Channels & Social Tagging Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Send className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Submission Method & Tagging
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                How candidates deliver videos and what social media tags must be included.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Submission Method Description</span>
              </Label>
              <Input
                value={data.videoSubmissionMethod}
                onChange={(e) => onChange({ videoSubmissionMethod: e.target.value })}
                placeholder="WhatsApp Submission directly to Organizing Committee"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audition Helpline / Video Receiving WhatsApp</span>
              </Label>
              <Input
                value={data.whatsappContact}
                onChange={(e) => onChange({ whatsappContact: e.target.value })}
                placeholder="+977 9704571941"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#356FA8]" />
              <span>Required Hashtags & Tags for Social Posts</span>
            </Label>
            <Input
              value={data.requiredHashtags}
              onChange={(e) => onChange({ requiredHashtags: e.target.value })}
              placeholder="#MithilaQueen2026 #OriginFoundation #JanakpurDham #MithilaCulture"
              className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
            />
            <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
              Instruct participants to tag these in their TikTok or Instagram audition clips.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
              <span>Step-by-Step Instructions for Applicants</span>
            </Label>
            <Textarea
              value={data.applicantInstructions}
              onChange={(e) => onChange({ applicantInstructions: e.target.value })}
              placeholder="1. Record your 60-90 second introduction in Maithili, Nepali, or English.&#10;2. Include your registered candidate name and city.&#10;3. Send the file on WhatsApp to +977 9704571941 with your Registration ID."
              rows={4}
              className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

