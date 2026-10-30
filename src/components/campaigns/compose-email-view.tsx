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
    id: "PENDING",
    label: "Pending Applications",
    description: "Applications submitted and currently under review",
  },
  {
    id: "ACTION_REQUIRED",
    label: "Action Required",
    description: "Contestants who need to resubmit documents or clarifications",
  },
  {
    id: "REJECTED",
    label: "Rejected Applications",
    description: "Submissions that did not qualify or meet requirements",
  },
  {
    id: "PAYMENT_VERIFIED",
    label: "Verified Payments",
    description: "Contestants whose NPR 399 entry fee is verified",
  },
  {
    id: "PAYMENT_PENDING",
    label: "Pending Payments",
    description: "Contestants awaiting payment verification or screenshot check",
  },
  {
    id: "NONE",
    label: "None (Direct Addresses Only)",
    description: "Do not select a group; send only to manually entered addresses",
  },
];

export function ComposeEmailView({
  templates,
  adminEmail,
  duplicateId,
}: ComposeEmailViewProps) {
  const router = useRouter();

  // Basic Details
  const [internalName, setInternalName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<p>Dear {{participant_name}},</p><p><br></p><p>Regards,<br><strong>The Origin Foundation</strong></p>");

  // Targeting: Group + Manual
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

  // Scheduling (Nepal Time)
  const [sendOption, setSendOption] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");

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
        setInternalName(res.campaign.name);
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

      const criteria: RecipientCriteria = {
        type: selectedGroup === "NONE" ? "MANUAL" : (selectedGroup as any),
        targetType:
          selectedGroup === "NONE"
            ? "MANUAL"
            : manualEmails.length > 0
            ? "COMBINED"
            : "GROUP",
        groupFilter: selectedGroup === "NONE" ? undefined : selectedGroup,
        manualEmails: manualEmails,
        excludeUnsubscribed: true,
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
  }, [selectedGroup, manualEmails]);

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
    if ((estimatedCount || 0) === 0) {
      toast.error("No recipients found for this selection. Please select a group or add manual addresses.");
      return;
    }

    setIsSubmitting(true);

    const criteria: RecipientCriteria = {
      type: selectedGroup === "NONE" ? "MANUAL" : (selectedGroup as any),
      targetType:
        selectedGroup === "NONE"
          ? "MANUAL"
          : manualEmails.length > 0
          ? "COMBINED"
          : "GROUP",
      groupFilter: selectedGroup === "NONE" ? undefined : selectedGroup,
      manualEmails: manualEmails,
      excludeUnsubscribed: true,
    };

    const res = await createCampaignAction({
      name: internalName.trim() || undefined,
      templateId: selectedTemplateId || undefined,
      subject: subject.trim(),
      content: content.trim(),
      criteria,
      sendOption,
      scheduledDate: sendOption === "scheduled" ? scheduledDate : undefined,
      scheduledTime: sendOption === "scheduled" ? scheduledTime : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsReviewModalOpen(false);
      toast.success(
        sendOption === "scheduled"
          ? "Communication scheduled successfully!"
          : "Communication enqueued! Delivery has started."
      );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link
              href="/admin/campaigns"
              className="hover:text-[#A64B36] transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Communications</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-bold">Compose Email</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight font-serif">
              Compose Email
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F8FAFC] text-[#C5A880] border border-[#E2E8F0]">
              <Crown className="w-3 h-3 text-[#C5A880]" />
              <span>Mithila Queen</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Send announcements, audition schedules, status updates and important notices to participants.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            className="text-xs font-bold h-9 px-3 border-zinc-300 hover:bg-zinc-100 rounded-xl gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-zinc-500" />
            <span>Send Test</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
            className="text-xs font-bold h-9 px-3 border-zinc-300 hover:bg-zinc-100 rounded-xl gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Review & Send</span>
          </Button>
        </div>
      </div>

      {/* Main Composer Sections */}
      <div className="space-y-6">
        {/* Section 1: Message Details & Templates */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C5A880]" />
                  <span>1. Email Details</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Set the subject line and optionally start from a predefined Mithila Queen template.
                </CardDescription>
              </div>

              {/* Predefined Template Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">
                  Load Template:
                </span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-800 focus:outline-[#C5A880]"
                >
                  <option value="">Blank Message (Custom)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Subject Line */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Email Subject <span className="text-rose-600">*</span></span>
                <span className="text-[11px] font-normal text-zinc-400">
                  Supports dynamic variables like <code className="bg-zinc-100 px-1 py-0.5 rounded text-[10px]">&#123;&#123;participant_name&#125;&#125;</code>
                </span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Mithila Queen Audition Schedule & Verification Update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-sm font-semibold text-zinc-900 border-zinc-200 focus-visible:ring-[#C5A880]"
              />
            </div>

            {/* Internal Campaign Name (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                <span>Internal Reference Name</span>
                <span className="text-[11px] font-normal text-zinc-400">(Optional — participants will never see this)</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Round 1 Audition Call - Madhesh Region"
                value={internalName}
                onChange={(e) => setInternalName(e.target.value)}
                className="text-xs text-zinc-700 border-zinc-200 focus-visible:ring-[#C5A880]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Gmail-Style Recipient Selection */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C5A880]" />
                  <span>2. Recipient Selection</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Target a participant group, enter individual emails, or combine both. Duplicates are automatically prevented.
                </CardDescription>
              </div>

              {/* Total Recipient Count Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0A192F]">
                {isEstimating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                )}
                <span>
                  {isEstimating
                    ? "Calculating..."
                    : `${estimatedCount ?? 0} Unique Recipient${(estimatedCount ?? 0) === 1 ? "" : "s"}`}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-5">
            {/* Option A: Participant Groups */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-800">
                  Option A: Mithila Queen Participant Group
                </Label>
                <span className="text-[11px] text-zinc-400">
                  Live counts from database
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {PARTICIPANT_GROUPS.map((grp) => {
                  const isSelected = selectedGroup === grp.id;
                  const count =
                    grp.id === "NONE"
                      ? null
                      : groupCounts[grp.id] ?? 0;

                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSelectedGroup(grp.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#0A192F] text-white border-[#0A192F] shadow-xs"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="font-bold text-[12px] truncate">
                          {grp.label}
                        </span>
                        {count !== null && (
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-[#C5A880] text-white"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10px] mt-1.5 leading-snug line-clamp-2 ${
                          isSelected ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {grp.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white px-3 text-zinc-400">
                  And / Or Add Direct Email Addresses
                </span>
              </div>
            </div>

            {/* Option B: Gmail-Style Manual Email Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                <span>Option B: Direct Email Addresses (Gmail-Style)</span>
                <span className="text-[11px] font-normal text-zinc-400">
                  Type or paste addresses (comma, semicolon, or Enter separated)
                </span>
              </Label>

              <GmailRecipientInput
                value={manualEmails}
                onChange={setManualEmails}
                placeholder="Type participant email and press Enter..."
              />
            </div>

            {/* Recipient Privacy & Deduplication Guarantee */}
            <div className="bg-[#F8FAFC]/70 rounded-xl border border-[#E2E8F0] p-3 flex items-start gap-2.5 text-xs text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[#0A192F]">
                  Confidential &amp; Individual Delivery (BCC-Safe)
                </span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Recipients will be delivered individual emails via our asynchronous background queue. No participant can see any other recipient&apos;s email address. Addresses matching both a participant group and manual entry are automatically deduplicated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Visual Message Editor & Dynamic Variables */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C5A880]" />
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

        {/* Section 4: Delivery Schedule */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A880]" />
              <span>4. Delivery Schedule</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Choose whether to launch immediate delivery or schedule for a specific date and time in Nepal Time.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Send Now */}
              <button
                type="button"
                onClick={() => setSendOption("immediate")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  sendOption === "immediate"
                    ? "bg-[#0A192F] text-white border-[#0A192F] shadow-xs"
                    : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <Send className={`w-4 h-4 mt-0.5 shrink-0 ${sendOption === "immediate" ? "text-[#C5A880]" : "text-zinc-400"}`} />
                <div>
                  <div className="font-bold text-xs">Send Now</div>
                  <p className={`text-[11px] mt-1 ${sendOption === "immediate" ? "text-zinc-300" : "text-zinc-500"}`}>
                    Queue message immediately and begin delivery through background worker.
                  </p>
                </div>
              </button>

              {/* Schedule Later */}
              <button
                type="button"
                onClick={() => setSendOption("scheduled")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  sendOption === "scheduled"
                    ? "bg-[#0A192F] text-white border-[#0A192F] shadow-xs"
                    : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <Calendar className={`w-4 h-4 mt-0.5 shrink-0 ${sendOption === "scheduled" ? "text-[#C5A880]" : "text-zinc-400"}`} />
                <div>
                  <div className="font-bold text-xs">Schedule for Later</div>
                  <p className={`text-[11px] mt-1 ${sendOption === "scheduled" ? "text-zinc-300" : "text-zinc-500"}`}>
                    Hold message in queue until your designated date &amp; time (Nepal Time).
                  </p>
                </div>
              </button>
            </div>

            {/* Date & Time Picker when scheduled */}
            {sendOption === "scheduled" && (
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A192F]">
                  <Clock className="w-4 h-4 text-[#C5A880]" />
                  <span>Configure Schedule in Nepal Time (Asia/Kathmandu UTC+05:45)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-zinc-600">
                      Scheduled Date
                    </Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="bg-white text-xs border-zinc-200 focus-visible:ring-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-zinc-600">
                      Scheduled Time (Nepal Standard Time)
                    </Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-white text-xs border-zinc-200 focus-visible:ring-[#C5A880]"
                    />
                  </div>
                </div>

                {scheduledDate && (
                  <div className="text-[11px] font-semibold text-[#A64B36] pt-1">
                    Summary: Your email will be sent on {scheduledDate} at {scheduledTime} Nepal Time.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Sticky Action Bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-zinc-700">Estimated Audience:</span>
            <span className="font-black text-[#0A192F] font-mono text-sm">
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
              className="text-xs font-bold h-9 px-3 border-zinc-300 hover:bg-zinc-100 rounded-xl flex-1 sm:flex-none"
            >
              Send Test
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewModalOpen(true)}
              className="text-xs font-bold h-9 px-3 border-zinc-300 hover:bg-zinc-100 rounded-xl flex-1 sm:flex-none"
            >
              Preview
            </Button>

            <Button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              disabled={hasInvalidManualEmails || (estimatedCount ?? 0) === 0}
              className="bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs h-9 px-5 rounded-xl gap-2 flex-1 sm:flex-none shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Review &amp; Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Send Test Email */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-sm font-bold text-zinc-900">Send Test Email</h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              We will send a live preview of this email with sample participant data. The email subject will be prefixed with <code className="text-[11px] font-bold bg-zinc-100 px-1 py-0.5 rounded">[TEST]</code>.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">
                Destination Email
              </Label>
              <Input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
                className="text-xs h-8 px-3 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs h-8 px-4 rounded-lg gap-1.5"
              >
                {isSendingTest && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />}
                <span>{isSendingTest ? "Sending..." : "Send Test Email"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Preview */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-3xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-sm font-bold text-zinc-900">Email Live Preview</h3>
                <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-semibold">
                  Sample Contestant Data
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop / Mobile Toggle */}
                <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      previewDevice === "desktop"
                        ? "bg-white text-black shadow-2xs"
                        : "text-zinc-600 hover:text-black"
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
                        ? "bg-white text-black shadow-2xs"
                        : "text-zinc-600 hover:text-black"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subject Preview Bar */}
            <div className="px-6 py-2.5 bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-700 flex items-center gap-2">
              <span className="font-bold text-zinc-500">Subject:</span>
              <span className="font-semibold text-zinc-900 truncate">{previewSubject}</span>
            </div>

            {/* Simulated Device Frame */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-200/50 flex items-start justify-center">
              <div
                className={`bg-white shadow-xl transition-all duration-200 rounded-xl overflow-hidden border border-zinc-200 w-full ${
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
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-base font-bold text-zinc-900">
                  Review Your Email Communication
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                  Email Subject
                </span>
                <p className="font-semibold text-zinc-900 text-sm">
                  {subject || "(No subject provided)"}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                  Recipients Breakdown
                </span>
                <div className="flex items-center justify-between text-zinc-700">
                  <span>Selected Participant Group:</span>
                  <span className="font-bold">
                    {PARTICIPANT_GROUPS.find((g) => g.id === selectedGroup)?.label}
                  </span>
                </div>
                {manualEmails.length > 0 && (
                  <div className="flex items-center justify-between text-zinc-700">
                    <span>Direct Addresses:</span>
                    <span className="font-bold">{manualEmails.length} address{manualEmails.length > 1 ? "es" : ""}</span>
                  </div>
                )}
                <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between font-bold text-[#0A192F] text-sm">
                  <span>Total Deduplicated Recipients:</span>
                  <span className="font-mono">{estimatedCount ?? 0}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                  Delivery Time
                </span>
                <p className="font-semibold text-zinc-800">
                  {sendOption === "immediate" ? (
                    "Immediate (queued right now)"
                  ) : (
                    <span>
                      {scheduledDate} at {scheduledTime} (Nepal Standard Time)
                    </span>
                  )}
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
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || (estimatedCount ?? 0) === 0 || hasInvalidManualEmails}
                className="bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-bold h-9 px-5 rounded-xl gap-2 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />}
                <span>
                  {isSubmitting
                    ? "Enqueuing..."
                    : sendOption === "scheduled"
                    ? "Confirm & Schedule"
                    : "Confirm & Send Now"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

