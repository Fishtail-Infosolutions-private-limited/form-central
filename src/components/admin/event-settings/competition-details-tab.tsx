"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Trophy,
  Building2,
  Phone,
  Globe,
  Video,
  Share2,
  Sparkles,
} from "lucide-react";

interface CompetitionDetailsTabProps {
  data: {
    competitionName: string;
    competitionTagline: string;
    shortIntro: string;
    fullDescription: string;
    organizationName: string;
    organizationTagline: string;
    officialEmail: string;
    location: string;
    whatsappContact: string;
    officialInstagram: string;
    officialTiktok: string;
    officialFacebook: string;
    officialYoutube: string;
  };
  onChange: (updates: Partial<CompetitionDetailsTabProps["data"]>) => void;
}

export function CompetitionDetailsTab({ data, onChange }: CompetitionDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Primary Identity Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Competition Identity
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Official name, motto, and descriptive narrative for Mithila Queen.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Competition Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={data.competitionName}
                onChange={(e) => onChange({ competitionName: e.target.value })}
                placeholder="Mithila Queen"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                Displayed as the main competition banner title.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Motto / Official Tagline
              </Label>
              <Input
                value={data.competitionTagline}
                onChange={(e) => onChange({ competitionTagline: e.target.value })}
                placeholder="Celebrating Mithila's Culture, Confidence & Talent."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                Headline motto appearing in hero sections and certificates.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Short Introduction
            </Label>
            <Textarea
              value={data.shortIntro}
              onChange={(e) => onChange({ shortIntro: e.target.value })}
              placeholder="A dedicated cultural and talent-oriented competition celebrating the heritage, poise, and public expression of young women in Mithila."
              rows={2}
              className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
            />
            <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
              Used in meta tags, preview snippets, and quick summaries.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Full Description & Cultural Background (Rich Text)
            </Label>
            <div className="border border-[var(--color-brand-border,#DCD8D1)] rounded-md overflow-hidden bg-white">
              <RichTextEditor
                name="fullDescription"
                value={data.fullDescription}
                onChange={(val) => onChange({ fullDescription: val })}
                placeholder="Detail the background, judging criteria, vision, and mission of Mithila Queen..."
                minHeight="180px"
              />
            </div>
            <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
              Formatted overview shown on the official competition overview page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Organizing Entity Details */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Organizing Body
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                The institutional foundation and headquarters presentation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Organization Display Name
              </Label>
              <Input
                value={data.organizationName}
                onChange={(e) => onChange({ organizationName: e.target.value })}
                placeholder="The Origin Foundation"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Organization Tagline
              </Label>
              <Input
                value={data.organizationTagline}
                onChange={(e) => onChange({ organizationTagline: e.target.value })}
                placeholder="Rooted in Identity. Driven by Purpose."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Official Head Office Location
              </Label>
              <Input
                value={data.location}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="Janakpur Dham, Nepal"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Primary Support Email
              </Label>
              <Input
                value={data.officialEmail}
                onChange={(e) => onChange({ officialEmail: e.target.value })}
                placeholder="originfoundation107@gmail.com"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Communication & Social Links */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Official Helplines & Social Channels
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                WhatsApp audition line and public handles linked across footers and audition pages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official WhatsApp Audition Helpline</span>
              </Label>
              <Input
                value={data.whatsappContact}
                onChange={(e) => onChange({ whatsappContact: e.target.value })}
                placeholder="+977 9704571941"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                Used for instant participant questions and direct video audition delivery.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Official Instagram Handle / Link</span>
              </Label>
              <Input
                value={data.officialInstagram}
                onChange={(e) => onChange({ officialInstagram: e.target.value })}
                placeholder="@theoriginfoundation or https://instagram.com/..."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-text,#292824)]" />
                <span>Official TikTok Handle</span>
              </Label>
              <Input
                value={data.officialTiktok}
                onChange={(e) => onChange({ officialTiktok: e.target.value })}
                placeholder="@theoriginfoundation"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Official Facebook Page</span>
              </Label>
              <Input
                value={data.officialFacebook}
                onChange={(e) => onChange({ officialFacebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-600" />
                <span>Official YouTube Channel</span>
              </Label>
              <Input
                value={data.officialYoutube}
                onChange={(e) => onChange({ officialYoutube: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
