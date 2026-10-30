"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Globe,
  Bell,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Megaphone,
} from "lucide-react";

export interface CompetitionHighlight {
  id: string;
  title: string;
  description: string;
}

export interface NoticeBanner {
  enabled: boolean;
  type: "info" | "warning" | "urgent";
  title: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
}

export interface ContactInfo {
  phonePrimary: string;
  phoneSecondary: string;
  supportEmail: string;
  officeHours: string;
  physicalAddress: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  content: string;
  isPublished: boolean;
}

interface PublicInformationTabProps {
  data: {
    homepageIntroText: string;
    highlights: CompetitionHighlight[];
    notice: NoticeBanner;
    contact: ContactInfo;
    announcements: AnnouncementItem[];
  };
  onChange: (updates: Partial<PublicInformationTabProps["data"]>) => void;
}

export function PublicInformationTab({ data, onChange }: PublicInformationTabProps) {
  // Highlights handlers
  const handleAddHighlight = () => {
    const newHighlight: CompetitionHighlight = {
      id: `hl-${Date.now()}`,
      title: "New Cultural Highlight",
      description: "Briefly explain this key competition aspect or cultural evaluation pillar.",
    };
    onChange({ highlights: [...(data.highlights || []), newHighlight] });
  };

  const handleUpdateHighlight = (id: string, updates: Partial<CompetitionHighlight>) => {
    const updated = (data.highlights || []).map((h) => (h.id === id ? { ...h, ...updates } : h));
    onChange({ highlights: updated });
  };

  const handleDeleteHighlight = (id: string) => {
    onChange({ highlights: (data.highlights || []).filter((h) => h.id !== id) });
  };

  // Announcements handlers
  const handleAddAnnouncement = () => {
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: "Official Update",
      date: new Date().toISOString().split("T")[0],
      content: "Details regarding auditions, schedules, or candidate guidelines.",
      isPublished: true,
    };
    onChange({ announcements: [...(data.announcements || []), newAnn] });
  };

  const handleUpdateAnnouncement = (id: string, updates: Partial<AnnouncementItem>) => {
    const updated = (data.announcements || []).map((a) => (a.id === id ? { ...a, ...updates } : a));
    onChange({ announcements: updated });
  };

  const handleDeleteAnnouncement = (id: string) => {
    onChange({ announcements: (data.announcements || []).filter((a) => a.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Homepage Intro Text Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Homepage Hero Narrative & Presentation
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Lead promotional and cultural positioning statement on the index page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Homepage Intro Paragraph
            </Label>
            <Textarea
              value={data.homepageIntroText}
              onChange={(e) => onChange({ homepageIntroText: e.target.value })}
              placeholder="An institutional platform created to celebrate cultural identity, articulate personal voice, and champion the creativity of young women across Janakpur Dham and Nepal."
              rows={3}
              className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
            />
            <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
              Appears directly below the main hero title on the homepage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notices Banner */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                  Important Public Notice / Alert Banner
                </CardTitle>
                <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                  Top-of-page alert banner for critical competition deadlines or updates.
                </CardDescription>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.notice?.enabled ?? false}
                onChange={(e) =>
                  onChange({
                    notice: { ...(data.notice || { type: "info", title: "", message: "" }), enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-[var(--color-brand-primary,#5C5751)] focus:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <span className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Banner Active
              </span>
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Banner Alert Style
              </Label>
              <select
                value={data.notice?.type || "info"}
                onChange={(e) =>
                  onChange({
                    notice: {
                      ...(data.notice || { enabled: false, title: "", message: "" }),
                      type: e.target.value as any,
                    },
                  })
                }
                className="w-full h-10 px-3 text-xs border border-[var(--color-brand-border,#DCD8D1)] rounded-md bg-white text-[var(--color-brand-text,#292824)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary,#5C5751)]"
              >
                <option value="info">Informational (Warm Blue / Neutral)</option>
                <option value="warning">Important Notice (Amber / Saffron)</option>
                <option value="urgent">Urgent Announcement (Maroon / Rose)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Notice Headline
              </Label>
              <Input
                value={data.notice?.title || ""}
                onChange={(e) =>
                  onChange({
                    notice: {
                      ...(data.notice || { enabled: false, type: "info", message: "" }),
                      title: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Audition Video Submission Deadline Extended to Baishakh 15"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Detailed Notice Message
            </Label>
            <Textarea
              value={data.notice?.message || ""}
              onChange={(e) =>
                onChange({
                  notice: {
                    ...(data.notice || { enabled: false, type: "info", title: "" }),
                    message: e.target.value,
                  },
                })
              }
              placeholder="Participants may submit audition clips via WhatsApp until 5:00 PM."
              rows={2}
              className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Competition Highlights / Pillars */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                  Competition Pillars & Cultural Highlights ({data.highlights?.length || 0})
                </CardTitle>
                <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                  Key cultural competencies and mission pillars highlighted on the website.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddHighlight}
              className="text-xs h-8 border-[var(--color-brand-border,#DCD8D1)] gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pillar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {(data.highlights || []).length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--color-brand-muted,#8A8580)] space-y-2">
              <p>No custom highlights added. Default 4 cultural evaluation pillars will be displayed.</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddHighlight}
                className="text-xs h-8 border-[var(--color-brand-border,#DCD8D1)]"
              >
                Add First Highlight
              </Button>
            </div>
          ) : (
            (data.highlights || []).map((h, i) => (
              <div
                key={h.id}
                className="p-3.5 rounded-lg border border-[var(--color-brand-border,#DCD8D1)] bg-[var(--color-brand-surface,#F3F1ED)]/20 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded bg-[var(--color-brand-surface,#F3F1ED)] border border-[var(--color-brand-border,#DCD8D1)] text-[10px] font-bold font-mono text-[var(--color-brand-text,#292824)] flex items-center justify-center">
                      0{i + 1}
                    </span>
                    <Input
                      value={h.title}
                      onChange={(e) => handleUpdateHighlight(h.id, { title: e.target.value })}
                      placeholder="Pillar title (e.g. Cultural Pride & Heritage)"
                      className="h-8 text-xs font-semibold border-[var(--color-brand-border,#DCD8D1)] bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteHighlight(h.id)}
                    className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={h.description}
                  onChange={(e) => handleUpdateHighlight(h.id, { description: e.target.value })}
                  placeholder="Describe this pillar's significance to participants..."
                  rows={2}
                  className="text-xs border-[var(--color-brand-border,#DCD8D1)] bg-white resize-none"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Official Contact Desk Information */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Public Contact & Support Desk
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Contact numbers, support hours, and direct desk assistance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary Desk Contact (MD Gaurav Gupta)</span>
              </Label>
              <Input
                value={data.contact?.phonePrimary || ""}
                onChange={(e) =>
                  onChange({
                    contact: { ...(data.contact || {} as any), phonePrimary: e.target.value },
                  })
                }
                placeholder="+977 9704571941"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secondary Desk Contact (Dipendra Shah Kalwar)</span>
              </Label>
              <Input
                value={data.contact?.phoneSecondary || ""}
                onChange={(e) =>
                  onChange({
                    contact: { ...(data.contact || {} as any), phoneSecondary: e.target.value },
                  })
                }
                placeholder="+977 981-2005468"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Official Inquiries Email</span>
              </Label>
              <Input
                value={data.contact?.supportEmail || ""}
                onChange={(e) =>
                  onChange({
                    contact: { ...(data.contact || {} as any), supportEmail: e.target.value },
                  })
                }
                placeholder="originfoundation107@gmail.com"
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Helpline Office Hours</span>
              </Label>
              <Input
                value={data.contact?.officeHours || ""}
                onChange={(e) =>
                  onChange({
                    contact: { ...(data.contact || {} as any), officeHours: e.target.value },
                  })
                }
                placeholder="Sunday - Friday &bull; 9:00 AM - 6:00 PM NPT"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Announcements */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                  Public Announcements & Press Bulletins ({data.announcements?.length || 0})
                </CardTitle>
                <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                  Dated official notices published for participants and press.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddAnnouncement}
              className="text-xs h-8 border-[var(--color-brand-border,#DCD8D1)] gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Announcement</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {(data.announcements || []).length === 0 ? (
            <p className="text-center py-6 text-xs text-[var(--color-brand-muted,#8A8580)]">
              No press announcements published. Add an announcement when audition schedules or official updates are ready.
            </p>
          ) : (
            (data.announcements || []).map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-lg border border-[var(--color-brand-border,#DCD8D1)] bg-white space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={a.title}
                    onChange={(e) => handleUpdateAnnouncement(a.id, { title: e.target.value })}
                    placeholder="Announcement title"
                    className="h-8 text-xs font-semibold border-[var(--color-brand-border,#DCD8D1)] flex-1"
                  />
                  <Input
                    type="date"
                    value={a.date}
                    onChange={(e) => handleUpdateAnnouncement(a.id, { date: e.target.value })}
                    className="h-8 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] w-36"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-brand-text,#292824)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={a.isPublished}
                      onChange={(e) => handleUpdateAnnouncement(a.id, { isPublished: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-[var(--color-brand-primary,#5C5751)]"
                    />
                    <span>Active</span>
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={a.content}
                  onChange={(e) => handleUpdateAnnouncement(a.id, { content: e.target.value })}
                  placeholder="Body of announcement..."
                  rows={2}
                  className="text-xs border-[var(--color-brand-border,#DCD8D1)] resize-none"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

