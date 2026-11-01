"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Users,
  Eye,
  Send,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Crown,
  Calendar,
  ShieldCheck,
  FileText,
  AlertTriangle,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AVAILABLE_EMAIL_VARIABLES,
  renderEmailTemplate,
  getSamplePreviewContext,
} from "@/lib/email/variables";
import { wrapInFormSuiteEmailLayout } from "@/lib/email/html-wrapper";
import {
  estimateRecipientsAction,
  sendTestEmailAction,
  createCampaignAction,
  getParticipantGroupCountsAction,
  getDuplicateCommunicationAction,
} from "@/server/actions/campaign-actions";
import { RecipientCriteria, ParticipantGroupFilter } from "@/lib/email/queue";
import { GmailRecipientInput } from "./gmail-recipient-input";
import { EmailRichEditor } from "./email-rich-editor";
import { toast } from "sonner";
import { formatNepalTime } from "@/lib/utils/timezone";

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  subject: string;
  bodyHtml: string;
}

interface ComposeEmailViewProps {
  templates: TemplateOption[];
  adminEmail: string;
  duplicateId?: string | null;
}

const PARTICIPANT_GROUPS: {
  id: ParticipantGroupFilter | "NONE";
  label: string;
  description: string;
}[] = [
  {
    id: "ALL",
    label: "All Participants",
    description: "Every registered Mithila Queen contestant",
  },
  {
    id: "APPROVED",
    label: "Approved Contestants",
    description: "Contestants whose applications have been verified & approved",
  },
  {
    id: "REJECTED",
    label: "Rejected Applications",
    description: "Submissions that did not qualify or meet requirements",
  },
];

export function ComposeEmailView({
  templates,
  adminEmail,
  duplicateId,
}: ComposeEmailViewProps) {
  const router = useRouter();

  // Basic Details
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<p>Dear {{participant_name}},</p><p><br></p><p>Regards,<br><strong>The Origin Foundation</strong></p>");

  // Targeting: Group + Manual
  const [recipientTab, setRecipientTab] = useState<"GROUP" | "DIRECT">("GROUP");
  const [selectedGroup, setSelectedGroup] = useState<ParticipantGroupFilter | "NONE">("ALL");
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({
    ALL: 0,
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
    ACTION_REQUIRED: 0,
    PAYMENT_VERIFIED: 0,
    PAYMENT_PENDING: 0,
  });

  // Estimation State
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(adminEmail);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load participant group counts on mount
  useEffect(() => {
    async function loadCounts() {
      const res = await getParticipantGroupCountsAction();
      if (res.success && res.counts) {
        setGroupCounts(res.counts);
      }
    }
    loadCounts();
  }, []);

  // Handle duplicate parameter
  useEffect(() => {
    if (!duplicateId) return;
    async function loadDuplicate() {
      const res = await getDuplicateCommunicationAction(duplicateId!);
      if (res.success && res.campaign) {
        setSubject(res.campaign.subject);
        setContent(res.campaign.content);
        if (res.campaign.templateId) {
          setSelectedTemplateId(res.campaign.templateId);
        }
        if (res.campaign.criteria) {
          const crit = res.campaign.criteria;
          if (crit.groupFilter) {
            setSelectedGroup(crit.groupFilter);
          } else if (crit.targetType === "MANUAL") {
            setSelectedGroup("NONE");
          }
          if (crit.manualEmails && Array.isArray(crit.manualEmails)) {
            setManualEmails(crit.manualEmails);
          }
        }
        toast.info("Message draft pre-filled from previous communication.");
      }
    }
    loadDuplicate();
  }, [duplicateId]);

  // Recalculate recipient estimate whenever group or manual emails change
  useEffect(() => {
    let isCancelled = false;

    async function recalculate() {
      setIsEstimating(true);

      const criteria: RecipientCriteria =
        recipientTab === "GROUP"
          ? {
              type: (selectedGroup as any) || "ALL",
              targetType: "GROUP",
              groupFilter: selectedGroup === "NONE" ? "ALL" : selectedGroup,
              manualEmails: [],
              excludeUnsubscribed: true,
            }
          : {
              type: "MANUAL",
              targetType: "MANUAL",
              groupFilter: undefined,
              manualEmails: manualEmails,
              excludeUnsubscribed: false,
            };

      try {
        const res = await estimateRecipientsAction(undefined, criteria);
        if (!isCancelled && res.success) {
          setEstimatedCount(res.count);
        }
      } catch (err) {
        console.error("Estimation failed", err);
      } finally {
        if (!isCancelled) setIsEstimating(false);
      }
    }

    const timer = setTimeout(recalculate, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [recipientTab, selectedGroup, manualEmails]);

  // Template selection handler
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    // If editor has custom content beyond initial skeleton, ask user
    const isCustomized =
      content.trim().length > 60 &&
      !content.includes("Regards,<br><strong>The Origin Foundation</strong></p>");

    if (
      isCustomized &&
      !confirm("Load this template? Your current message content will be replaced.")
    ) {
      return;
    }

    setSubject(tpl.subject);
    setContent(tpl.bodyHtml);
    toast.success(`Loaded "${tpl.name}" template.`);
  };

  // Test email handler
  const handleSendTest = async () => {
    if (!testEmailInput || !testEmailInput.includes("@")) {
      toast.error("Please enter a valid test email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter an email subject first.");
      return;
    }

    setIsSendingTest(true);
    const res = await sendTestEmailAction({
      subject,
      content,
      testEmail: testEmailInput.trim(),
    });
    setIsSendingTest(false);

    if (res.success) {
      toast.success(`Test email sent to ${testEmailInput}`);
      setIsTestModalOpen(false);
    } else {
      toast.error(res.error || "Failed to send test email.");
    }
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (!subject.trim()) {
      toast.error("Please enter an email subject.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter email message content.");
      return;
    }
    if (recipientTab === "DIRECT" && manualEmails.length === 0) {
      toast.error("Please enter at least one email address in Direct Email.");
      return;
    }
    if ((estimatedCount || 0) === 0) {
      toast.error("No recipients found for this selection. Please select a group or add manual addresses.");
      return;
    }

    setIsSubmitting(true);

    const criteria: RecipientCriteria =
      recipientTab === "GROUP"
        ? {
            type: (selectedGroup as any) || "ALL",
            targetType: "GROUP",
            groupFilter: selectedGroup === "NONE" ? "ALL" : selectedGroup,
            manualEmails: [],
            excludeUnsubscribed: true,
          }
        : {
            type: "MANUAL",
            targetType: "MANUAL",
            groupFilter: undefined,
            manualEmails: manualEmails,
            excludeUnsubscribed: false,
          };

    const res = await createCampaignAction({
      name: subject.trim(),
      templateId: selectedTemplateId || undefined,
      subject: subject.trim(),
      content: content.trim(),
      criteria,
      sendOption: "immediate",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsReviewModalOpen(false);
      toast.success("Email announcement enqueued! Delivery has started.");
      router.push("/admin/campaigns");
    } else {
      toast.error(res.error || "Failed to launch communication.");
    }
  };

  // Generate live preview HTML
  const sampleContext = getSamplePreviewContext({
    event_name: "Mithila Queen 2026",
    event_description: "Celebrating Mithila's Culture, Confidence & Talent",
    participant_name: "Pooja Mishra",
    participant_email: "pooja.mishra@example.com",
    registration_id: "MQ-2026-0814",
    participant_category: "Contestant",
    organizer_name: "The Origin Foundation",
    event_venue: "Janakpur Dham, Madhesh Province, Nepal",
    event_location: "Janakpur Dham, Nepal",
  });

  const previewSubject = renderEmailTemplate(subject || "Mithila Queen Official Update", sampleContext, { isHtml: false });
  const previewBody = renderEmailTemplate(content || "<p>Message content...</p>", sampleContext, { isHtml: true });
  const previewFullHtml = wrapInFormSuiteEmailLayout({
    eventTitle: "The Origin Foundation — Mithila Queen",
    badgeText: "Participant Notice",
    bodyHtml: previewBody,
    unsubscribeUrl: "https://theoriginfoundation.org/unsubscribe?sample=preview",
    showUnsubscribe: true,
  });

  const hasInvalidManualEmails = manualEmails.some(
    (e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link
              href="/admin/campaigns"
              className="hover:text-maroon transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Communications</span>
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-bold">Compose Email</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-maroon tracking-tight">
              Compose Email
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Send announcements, audition updates, and important notices to participants.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            className="text-xs font-bold h-9 px-3 border-cream-dark bg-warm-ivory text-stone-700 hover:bg-soft-cream rounded-xl gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-stone-500" />
            <span>Send Test</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
            className="text-xs font-bold h-9 px-3 border-cream-dark bg-warm-ivory text-stone-700 hover:bg-soft-cream rounded-xl gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            disabled={(recipientTab === "DIRECT" && manualEmails.length === 0) || (estimatedCount ?? 0) === 0}
            className="bg-maroon hover:bg-[#681724] text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-saffron" />
            <span>Review & Send</span>
          </Button>
        </div>
      </div>

      {/* Main Composer Sections */}
      <div className="space-y-6">
        {/* Section 1: Message Details & Templates */}
        <Card className="border-cream-dark bg-warm-ivory shadow-xs">
          <CardHeader className="pb-3 border-b border-cream-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-saffron" />
                  <span>1. Email Details</span>
                </CardTitle>
                <CardDescription className="text-xs text-stone-500 mt-0.5">
                  Set the subject line and optionally start from a predefined Mithila Queen template.
                </CardDescription>
              </div>

              {/* Predefined Template Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-500 whitespace-nowrap">
                  Load Template:
                </span>
                <div className="w-[230px]">
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(val) => handleTemplateSelect(val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-soft-cream border-cream-dark shadow-xs">
                      <SelectValue placeholder="Blank Message (Custom)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Blank Message (Custom)</SelectItem>
                      {templates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Subject Line */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Email Subject <span className="text-rose-600">*</span></span>
                <span className="text-[11px] font-normal text-stone-400">
                  Supports dynamic variables like <code className="bg-soft-cream text-maroon px-1 py-0.5 rounded text-[10px]">&#123;&#123;participant_name&#125;&#125;</code>
                </span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Mithila Queen Audition Schedule & Verification Update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-sm font-semibold text-stone-900 border-cream-dark focus-visible:ring-saffron"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Gmail-Style Recipient Selection */}
        <Card className="border-cream-dark bg-warm-ivory shadow-xs">
          <CardHeader className="pb-3 border-b border-cream-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-saffron" />
                  <span>2. Recipient Selection</span>
                </CardTitle>
                <CardDescription className="text-xs text-stone-500 mt-0.5">
                  Target a participant group or enter individual email addresses.
                </CardDescription>
              </div>

              {/* Total Recipient Count Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-soft-cream border border-cream-dark text-xs font-bold text-maroon">
                {isEstimating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-saffron" />
                )}
                <span>
                  {isEstimating
                    ? "Calculating..."
                    : `${estimatedCount ?? 0} Recipient${(estimatedCount ?? 0) === 1 ? "" : "s"}`}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Recipient Selection Tabs */}
            <div className="flex items-center gap-2 p-1 bg-soft-cream rounded-xl border border-cream-dark w-fit">
              <button
                type="button"
                onClick={() => setRecipientTab("GROUP")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  recipientTab === "GROUP"
                    ? "bg-maroon text-white shadow-xs"
                    : "text-charcoal hover:text-maroon hover:bg-white/50"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Participant Groups</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    recipientTab === "GROUP"
                      ? "bg-white/20 text-white"
                      : "bg-[#EADBCE] text-maroon"
                  }`}
                >
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientTab("DIRECT")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  recipientTab === "DIRECT"
                    ? "bg-maroon text-white shadow-xs"
                    : "text-charcoal hover:text-maroon hover:bg-white/50"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Email (Single / Custom)</span>
                {manualEmails.length > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      recipientTab === "DIRECT"
                        ? "bg-white/20 text-white"
                        : "bg-saffron text-white"
                    }`}
                  >
                    {manualEmails.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: Participant Groups */}
            {recipientTab === "GROUP" && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal">
                    Select Contestant Audience
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Live participant counts from database
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PARTICIPANT_GROUPS.map((grp) => {
                    const isSelected = selectedGroup === grp.id;
                    const count =
                      grp.id === "NONE" ? null : groupCounts[grp.id] ?? 0;

                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setSelectedGroup(grp.id)}
                        className={`text-left p-3.5 rounded-xl border text-xs transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-maroon text-white border-maroon shadow-xs"
                            : "bg-warm-ivory text-charcoal border-cream-dark hover:border-[#B89150] hover:bg-soft-cream/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-bold text-[13px] truncate">
                            {grp.label}
                          </span>
                          {count !== null && (
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-saffron text-white"
                                  : "bg-soft-cream text-maroon border border-cream-dark"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-2 leading-relaxed ${
                            isSelected ? "text-white/80" : "text-stone-500"
                          }`}
                        >
                          {grp.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Direct Email (Single / Custom) */}
            {recipientTab === "DIRECT" && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-charcoal">
                    Direct Email Addresses
                  </Label>
                  <span className="text-[11px] font-normal text-stone-500">
                    Type or paste addresses (comma, semicolon, or Enter separated)
                  </span>
                </div>

                <GmailRecipientInput
                  value={manualEmails}
                  onChange={setManualEmails}
                  placeholder="Type participant email and press Enter..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Visual Message Editor & Dynamic Variables */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-saffron" />
              <span>3. Message Content</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Write naturally using the document toolbar. No HTML knowledge required.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            <EmailRichEditor
              value={content}
              onChange={setContent}
            />
          </CardContent>
        </Card>

        {/* Bottom Sticky Action Bar */}
        <div className="bg-warm-ivory border border-cream-dark rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-stone-700">Estimated Audience:</span>
            <span className="font-black text-maroon font-mono text-sm">
              {estimatedCount ?? 0} recipient{(estimatedCount ?? 0) === 1 ? "" : "s"}
            </span>
            {hasInvalidManualEmails && (
              <span className="text-rose-600 text-[11px] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Fix invalid manual emails</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTestModalOpen(true)}
              className="text-xs font-bold h-9 px-3 border-cream-dark bg-warm-ivory text-stone-700 hover:bg-soft-cream rounded-xl flex-1 sm:flex-none"
            >
              Send Test
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewModalOpen(true)}
              className="text-xs font-bold h-9 px-3 border-cream-dark bg-warm-ivory text-stone-700 hover:bg-soft-cream rounded-xl flex-1 sm:flex-none"
            >
              Preview
            </Button>

            <Button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              disabled={(recipientTab === "DIRECT" && (manualEmails.length === 0 || hasInvalidManualEmails)) || (estimatedCount ?? 0) === 0}
              className="bg-maroon hover:bg-[#681724] text-white font-bold text-xs h-9 px-5 rounded-xl gap-2 flex-1 sm:flex-none shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-saffron" />
              <span>Review &amp; Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Send Test Email */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-ivory rounded-2xl border border-cream-dark p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-saffron" />
                <h3 className="text-sm font-bold text-stone-900">Send Test Email</h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              We will send a live preview of this email with sample participant data. The email subject will be prefixed with <code className="text-[11px] font-bold bg-soft-cream text-maroon px-1 py-0.5 rounded">[TEST]</code>.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-700">
                Destination Email
              </Label>
              <Input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                className="text-xs border-cream-dark bg-white focus-visible:ring-saffron"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-dark">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
                className="text-xs h-8 px-3 rounded-lg border-cream-dark hover:bg-soft-cream"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="bg-maroon hover:bg-[#681724] text-white text-xs h-8 px-4 rounded-lg gap-1.5"
              >
                {isSendingTest && <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />}
                <span>{isSendingTest ? "Sending..." : "Send Test Email"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Preview */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-ivory rounded-2xl border border-cream-dark max-w-3xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-cream-dark bg-soft-cream">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-saffron" />
                <h3 className="text-sm font-bold text-stone-900">Email Live Preview</h3>
                <span className="text-[10px] bg-[#EADBCE] text-maroon px-2 py-0.5 rounded-full font-semibold">
                  Sample Contestant Data
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop / Mobile Toggle */}
                <div className="flex items-center bg-[#EADBCE]/80 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      previewDevice === "desktop"
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      previewDevice === "mobile"
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subject Preview Bar */}
            <div className="px-6 py-2.5 bg-warm-ivory border-b border-cream-dark text-xs text-stone-700 flex items-center gap-2">
              <span className="font-bold text-stone-500">Subject:</span>
              <span className="font-semibold text-stone-900 truncate">{previewSubject}</span>
            </div>

            {/* Simulated Device Frame */}
            <div className="flex-1 overflow-y-auto p-6 bg-soft-cream/50 flex items-start justify-center">
              <div
                className={`bg-white shadow-xl transition-all duration-200 rounded-xl overflow-hidden border border-cream-dark w-full ${
                  previewDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: previewFullHtml }}
                  className="p-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Final Review Before Sending */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-ivory rounded-2xl border border-cream-dark p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-saffron" />
                <h3 className="text-base font-bold text-maroon">
                  Review Your Email Communication
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-soft-cream rounded-xl border border-cream-dark space-y-1">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                  Email Subject
                </span>
                <p className="font-semibold text-stone-900 text-sm">
                  {subject || "(No subject provided)"}
                </p>
              </div>

              <div className="p-3 bg-soft-cream rounded-xl border border-cream-dark space-y-1.5">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                  Recipients Breakdown
                </span>
                <div className="flex items-center justify-between text-stone-700">
                  <span>Selected Audience:</span>
                  <span className="font-bold text-maroon">
                    {recipientTab === "GROUP"
                      ? PARTICIPANT_GROUPS.find((g) => g.id === selectedGroup)?.label || "All Participants"
                      : `${manualEmails.length} Direct Email Address${manualEmails.length === 1 ? "" : "es"}`}
                  </span>
                </div>
                <div className="border-t border-cream-dark pt-1.5 flex items-center justify-between font-bold text-maroon text-sm">
                  <span>Total Recipients:</span>
                  <span className="font-mono text-base">{estimatedCount ?? 0}</span>
                </div>
              </div>

              <div className="p-3 bg-soft-cream rounded-xl border border-cream-dark space-y-1">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                  Delivery Method
                </span>
                <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-saffron" />
                  <span>Immediate Delivery (Queued immediately)</span>
                </p>
              </div>

              {/* Warning when 0 recipients */}
              {(estimatedCount ?? 0) === 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="text-[11px] leading-relaxed">
                    There are 0 recipients for this communication. Please select a group that contains participants or add manual email addresses.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-dark">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-xs h-9 px-4 rounded-xl border-cream-dark hover:bg-soft-cream"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || (estimatedCount ?? 0) === 0 || (recipientTab === "DIRECT" && hasInvalidManualEmails)}
                className="bg-maroon hover:bg-[#681724] text-white text-xs font-bold h-9 px-5 rounded-xl gap-2 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />}
                <span>{isSubmitting ? "Enqueuing..." : "Confirm & Send Now"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

